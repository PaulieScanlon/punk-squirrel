import { useState, useRef, useEffect, useMemo } from 'react';
import { Form, useActionData, useRevalidator, useOutletContext, useNavigation } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { Octokit } from '@octokit/rest';
import { gsap } from 'gsap';

import * as DOMPurify from 'dompurify';

import AppLayout from '../../layouts/app-layout';
import AppSection from '../../components/app-section';
import FormSidebar from '../../components/form-sidebar';
import DatePicker from '../../components/date-picker';
import Select from '../../components/select';
import ErrorAnnounce from '../../components/error-announce';
import PlayerControls from '../../components/player-controls';
import SubmitButton from '../../components/submit-button';

import MainSvg from '../../charts/main-svg';
import RatioFrame from '../../charts/ratio-frame';
import ChartHeadingElements from '../../charts/chart-heading-elements';
import DateTicks from '../../charts/date-ticks';
import VerticalLegend from '../../charts/vertical-legend';
import HorizontalGuides from '../../charts/horizontal-guides';
import LineChartPolyline from '../../charts/line-chart-polyline';
import Watermark from '../../charts/watermark';
import MainCanvas from '../../charts/main-canvas';
import MainRender from '../../charts/main-render';

import { supabaseServer } from '../../supabase.server';

import { generateDateArray } from '../../utils/generate-date-array';
import { updateDateCount } from '../../utils/update-date-count';
import { formatDate } from '../../utils/format-date';
import { createLineChartProperties } from '../../utils/create-line-chart-properties';
import { createLineChartPoints } from '../../utils/create-line-chart-points';
import { createLineChartFills } from '../../utils/create-line-chart-fills';
import { createTicks } from '../../utils/create-ticks';
import { findMaxValue } from '../../utils/find-max-value';
import { findTotalValue } from '../../utils/find-total-value';
import { calculateAnimationDuration } from '../../utils/calculate-animation-duration';
import { createLegendRange } from '../../utils/create-legend-range';

export const action = async ({ request }) => {
  const { supabaseClient } = await supabaseServer(request);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session || !session.provider_token) {
    signOut();
    throw redirect('/');
  }

  const octokit = new Octokit({
    auth: session.provider_token,
  });

  const body = await request.formData();
  const owner = body.get('owner');
  const repo = body.get('repo');
  const state = body.get('state');
  const ratio = body.get('ratio');
  const dateFrom = body.get('dateFrom');
  const dateTo = body.get('dateTo');
  const dateDiff = body.get('dateDiff');

  const chartWidth = ratio;
  const chartHeight = 1080;
  const offsetY = 220;
  const _chartHeight = chartHeight - offsetY;
  const paddingL = 110;
  const paddingR = 75;
  const paddingY = 340;
  const guides = [...Array(8).keys()];

  const defaultResponse = {
    title: 'issues',
    owner,
    repo,
    state,
    dates: {
      from: formatDate(dateFrom),
      to: formatDate(dateTo),
      diff: dateDiff,
    },
    config: {
      chartWidth,
      chartHeight,
      _chartHeight,
      offsetY,
      paddingR,
      paddingL,
      paddingY,
      guides,
      color: state === 'open' ? '#3fb950' : '#f85149',
    },
  };

  try {
    // https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#list-repository-issues
    const response = await octokit.paginate('GET /repos/{owner}/{repo}/issues', {
      owner: owner,
      repo: repo,
      per_page: 100,
      sort: 'created',
      state: state,
      created: 'created',
      since: dateFrom,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const { dateRange } = updateDateCount(response, generateDateArray(dateFrom, dateDiff), 'created_at');

    const maxValue = findMaxValue(dateRange, 'count');
    const total = findTotalValue(dateRange, 'count');
    const properties = createLineChartProperties(
      dateRange,
      chartWidth,
      _chartHeight,
      maxValue,
      paddingR,
      paddingL,
      paddingY
    );

    return json({
      ...defaultResponse,
      response: {
        raw: response,
        status: 200,
        message: !response.length ? 'No Data' : '',
      },
      maxValue,
      total,
      ticks: createTicks(dateRange, chartWidth, _chartHeight, paddingR, paddingL),
      legend: createLegendRange(dateRange, guides.length, 'count'),
      properties: properties,
      points: createLineChartPoints(properties),
      fills: createLineChartFills(properties, _chartHeight),
      data: dateRange,
    });
  } catch (error) {
    return json({
      ...defaultResponse,
      response: {
        status: 404,
        message: error.response.data.message,
      },
      maxValue: 0,
      total: 0,
      ticks: [],
      properties: [],
      points: [],
      fills: [],
      data: [],
    });
  }
};

export const loader = async ({ request }) => {
  const { supabaseClient, headers } = await supabaseServer(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session || !session.provider_token) {
    throw redirect('/');
  }

  return json({
    headers,
  });
};

const Page = () => {
  const { supabase, user } = useOutletContext();

  const { state } = useNavigation();
  const data = useActionData();
  const revalidator = useRevalidator();

  const chartCanvasRef = useRef(null);
  const chartSvgRef = useRef(null);
  const chartMaskRef = useRef(null);
  const renderMessageRef = useRef(null);
  const timelineProgressRef = useRef(null);

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [interfaceState, setInterfaceState] = useState({
    animation: 'idle',
    timeline: 0,
    rendering: false,
    frames: [],
    ratio: 1920,
  });

  const dateFrom = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const dateTo = new Date();

  const [dates, setDates] = useState({
    from: dateFrom,
    to: dateTo,
    diff: Math.ceil((dateTo - dateFrom) / (24 * 60 * 60 * 1000)),
  });

  const tl = useMemo(
    () =>
      gsap.timeline({
        paused: true,
        onUpdate: () => {
          const svg = DOMPurify.sanitize(chartSvgRef.current);
          const src = `data:image/svg+xml;base64;utf8,${btoa(svg)}`;
          tempAnimationFrames.push(src);
          updateProgress();
        },
        onStart: () => {
          tempAnimationFrames.length = [];
        },
        onComplete: () => {
          setInterfaceState((prevState) => ({
            ...prevState,
            animation: 'idle',
            timeline: 1,
            frames: tempAnimationFrames,
          }));
        },
      }),
    []
  );

  let tempAnimationFrames = [];

  const updateProgress = () => {
    const progress = Math.round(tl.progress() * 100);
    timelineProgressRef.current.style.width = `${progress}%`;
  };

  useEffect(() => {
    const chartMask = chartMaskRef.current;

    if (data !== undefined && data.response.status === 200 && state === 'idle') {
      const duration = calculateAnimationDuration(dates.diff);
      const stagger = duration / dates.diff;

      tl.play();
      tl.to(chartMask, { duration: duration, width: data.config.chartWidth, ease: 'linear' });
      tl.to('#total', { duration: duration, textContent: data.total, snap: { textContent: 1 }, ease: 'linear' }, '<');
      tl.to(
        '.date',
        { duration: 0.3, transform: 'translateX(0px)', opacity: 1, stagger: stagger, ease: 'linear' },
        '<'
      );

      setInterfaceState((prevState) => ({
        ...prevState,
        animation: 'active',
        timeline: 0,
      }));
    } else {
      tl.clear();
      timelineProgressRef.current.style.width = '0%';
      renderMessageRef.current.innerHTML = '';
    }
  }, [data, state]);

  const handleRestartTimeline = () => {
    tl.restart();

    setInterfaceState((prevState) => ({
      ...prevState,
      animation: 'active',
      timeline: 0,
      frames: [],
    }));
  };

  const handlePlayPause = () => {
    const progress = Math.round(tl.progress() * 100);
    if (interfaceState.animation === 'idle') {
      if (progress === 100) {
        handleRestartTimeline();
      } else {
        tl.play();
        setInterfaceState((prevState) => ({
          ...prevState,
          animation: 'active',
          timeline: 0,
        }));
      }
    }

    if (interfaceState.animation === 'active') {
      tl.pause();
      setInterfaceState((prevState) => ({
        ...prevState,
        animation: 'idle',
        timeline: 0,
      }));
    }
  };

  const handleRender = async () => {
    setInterfaceState((prevState) => ({
      ...prevState,
      rendering: true,
    }));

    const canvas = chartCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let canvasFrames = [];

    let inc = 0;

    const createRasterizedImage = () => {
      const virtualImage = new Image();
      virtualImage.src = interfaceState.frames[inc];

      virtualImage.addEventListener('load', async () => {
        renderMessageRef.current.innerHTML = !data
          ? ''
          : `Preparing frame: ${inc} of ${interfaceState.frames.length - 1}`;
        ctx.clearRect(0, 0, data.config.chartWidth, data.config.chartHeight);
        ctx.drawImage(virtualImage, 0, 0, data.config.chartWidth, data.config.chartHeight);
        canvasFrames.push(canvas.toDataURL('image/jpeg'));
        inc++;
        if (inc < interfaceState.frames.length) {
          createRasterizedImage();
        } else {
          // console.log('onComplete');
          renderMessageRef.current.innerHTML = 'TODO: ffmpeg/WASM progress here';
          // TODO don't set rendering to false until after ffmpeg/WASM has completed
          setInterfaceState((prevState) => ({
            ...prevState,
            rendering: false,
          }));
        }
      });

      virtualImage.addEventListener('error', (error) => {
        // console.error('virtualImage.error: ', error);
      });
    };
    createRasterizedImage();
  };

  const handleRatio = (value) => {
    revalidator.revalidate();
    setInterfaceState((prevState) => ({
      ...prevState,
      animation: 'idle',
      ratio: value,
    }));
  };

  const handleDate = (value) => {
    setDates((prevState) => ({
      ...prevState,
      to: new Date(value),
      from: new Date(new Date(value) - dates.diff * 24 * 60 * 60 * 1000),
    }));
  };

  const handlePeriod = (value) => {
    setDates((prevState) => ({
      ...prevState,
      from: new Date(new Date(dates.to) - value * 24 * 60 * 60 * 1000),
      diff: value,
    }));
  };

  const handleState = () => {
    revalidator.revalidate();
  };

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const isDisabled = (state !== 'idle' && interfaceState.animation !== 'idle') || interfaceState.rendering;

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <AppSection>
          {/* {data ? <pre>{JSON.stringify(data.response.raw, null, 2)}</pre> : null} */}
          <RatioFrame ratio={interfaceState.ratio}>
            <MainSvg ref={chartSvgRef} ratio={interfaceState.ratio}>
              {data && data.response.status === 200 && state === 'idle' ? (
                <>
                  <defs>
                    <clipPath id='clip-mask'>
                      <rect ref={chartMaskRef} x='0' y='0' width={0} height={data.config.chartHeight} />
                    </clipPath>
                  </defs>

                  <VerticalLegend
                    values={data.legend}
                    chartHeight={data.config._chartHeight}
                    paddingY={data.config.paddingY}
                    paddingL={data.config.paddingL}
                  />

                  <HorizontalGuides
                    guides={data.config.guides}
                    chartWidth={data.config.chartWidth}
                    chartHeight={data.config._chartHeight}
                    paddingL={data.config.paddingL}
                    paddingR={data.config.paddingR}
                    paddingY={data.config.paddingY}
                  />

                  <ChartHeadingElements
                    chartWidth={data.config.chartWidth}
                    paddingR={data.config.paddingR}
                    color={data.config.color}
                    state={data.state}
                    owner={data.owner}
                    repo={data.repo}
                    title={data.title}
                    dates={data.dates}
                  />

                  <LineChartPolyline fills={data.fills} points={data.points} color={data.config.color} />
                  <DateTicks ticks={data.ticks} />
                  <Watermark chartWidth={data.config.chartWidth} chartHeight={data.config.chartHeight} />
                </>
              ) : null}
            </MainSvg>

            {data && state === 'idle' ? (
              <MainCanvas
                ref={chartCanvasRef}
                chartWidth={data.config.chartWidth}
                chartHeight={data.config.chartHeight}
              />
            ) : null}

            <PlayerControls
              isPlaying={interfaceState.animation != 'idle'}
              onPlayPause={handlePlayPause}
              onReplay={handleRestartTimeline}
              disabled={
                data === undefined || state !== 'idle' || interfaceState.rendering || data.response.status !== 200
              }
            >
              <div
                ref={timelineProgressRef}
                className={`${
                  interfaceState.rendering ? 'bg-brand-surface-2' : 'bg-brand-mid-gray'
                } rounded-full h-1 w-0 transition-all duration-100`}
              />
            </PlayerControls>
            <MainRender
              ref={renderMessageRef}
              handleRender={handleRender}
              isDisabled={
                data === undefined ||
                state !== 'idle' ||
                interfaceState.animation !== 'idle' ||
                interfaceState.timeline === 0 ||
                interfaceState.rendering ||
                data.response.status !== 200
              }
            />
          </RatioFrame>
          <FormSidebar title='Issues' dates={dates}>
            <Form method='post' className='flex flex-col gap-4' autoComplete='off'>
              <input hidden name='dateFrom' readOnly value={dates.from} />
              <input hidden name='dateTo' readOnly value={dates.to} />
              <input hidden name='dateDiff' readOnly value={dates.diff} />
              <div className='flex flex-col gap-2'>
                <DatePicker label='End Date' name='to' onChange={handleDate} disabled={isDisabled} />

                <Select
                  label='Period'
                  name='from'
                  placeholder='Select a period'
                  onChange={handlePeriod}
                  disabled={isDisabled}
                  items={[
                    { name: '7 Days', value: 7 },
                    { name: '14 Days', value: 14 },
                    { name: '30 Days', value: 30 },
                    { name: '60 Days', value: 60 },
                    { name: '90 Days', value: 90 },
                    { name: '180 Days', value: 180 },
                    { name: '360 Days', value: 360 },
                  ]}
                />

                <label>
                  Owner
                  <input type='text' defaultValue='' name='owner' disabled={isDisabled} required />
                </label>
                <label>
                  Repository
                  <input type='text' defaultValue='' name='repo' disabled={isDisabled} required />
                </label>

                <Select
                  label='State'
                  name='state'
                  placeholder='Select a state'
                  onChange={handleState}
                  disabled={isDisabled}
                  items={[
                    { name: 'open', value: 'open' },
                    { name: 'closed', value: 'closed' },
                  ]}
                />

                <Select
                  label='Ratio'
                  name='ratio'
                  placeholder='Select a ratio'
                  onChange={handleRatio}
                  disabled={isDisabled}
                  items={[
                    { name: '16:9', value: 1920 },
                    { name: '1:1', value: 1080 },
                  ]}
                />
              </div>
              <ErrorAnnounce message={data?.response.message} />
              <SubmitButton
                isDisabled={
                  state !== 'idle' ||
                  state !== 'idle' ||
                  interfaceState.animation !== 'idle' ||
                  interfaceState.rendering
                }
                state={state}
              />
            </Form>
          </FormSidebar>
        </AppSection>
      </AppLayout>
    </>
  );
};

export default Page;
