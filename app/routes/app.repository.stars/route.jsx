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
import MainRender from '../../components/main-render';

import MainSvg from '../../charts/main-svg';
import RatioFrame from '../../charts/ratio-frame';
import ChartHeadingElements from '../../charts/chart-heading-elements';
import DateTicks from '../../charts/date-ticks';
import YAxis from '../../charts/y-axis';
import HorizontalGuides from '../../charts/horizontal-guides';
import LineChartPolyline from '../../charts/line-chart-polyline';
import BarChartVertical from '../../charts/bar-chart-vertical';
import Watermark from '../../charts/watermark';
import MainCanvas from '../../charts/main-canvas';
import EndFrame from '../../charts/end-frame';

import { supabaseServer } from '../../supabase.server';

import { generateDateArray } from '../../utils/generate-date-array';
import { updateDateCount } from '../../utils/update-date-count';
import { formatDate } from '../../utils/format-date';
import { formatFilenameDate } from '../../utils/format-filename-date';
import { createLineChartProperties } from '../../utils/create-line-chart-properties';
import { createVerticalBarChartProperties } from '../../utils/create-vertical-bar-chart-properties';
import { createLineChartPoints } from '../../utils/create-line-chart-points';
import { createLineChartFills } from '../../utils/create-line-chart-fills';
import { createTicks } from '../../utils/create-ticks';
import { findMaxValue } from '../../utils/find-max-value';
import { findTotalValue } from '../../utils/find-total-value';
import { calculateAnimationDuration } from '../../utils/calculate-animation-duration';
import { createYAxisRange } from '../../utils/create-y-axis-range';
import { createVideoFromFrames } from '../../utils/create-video-from-frames';

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
  const ratio = body.get('ratio');

  const chartWidth = ratio;
  const chartHeight = 1080;
  const offsetX = 60;
  const offsetY = 220;
  const _chartHeight = chartHeight - offsetY;
  const paddingL = 60;
  const paddingR = 60;
  const paddingY = 340;
  const guides = [...Array(8).keys()];

  const defaultResponse = {
    title: 'stars',
    owner,
    repo,
    config: {
      chartWidth,
      chartHeight,
      _chartHeight,
      offsetX,
      offsetY,
      paddingR,
      paddingL,
      paddingY,
      guides,
      color: '#ffd33d',
    },
  };

  try {
    // https://docs.github.com/en/rest/activity/starring?apiVersion=2022-11-28#list-stargazers
    // const response = await octokit.paginate('GET /repos/{owner}/{repo}/stargazers', {
    //   owner: owner,
    //   repo: repo,
    //   per_page: 100,
    //   headers: {
    //     accept: 'application/vnd.github+json',
    //     'X-GitHub-Api-Version': '2022-11-28',
    //   },
    // });

    // https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
    const response = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: owner,
      repo: repo,

      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const total = response.data.stargazers_count;

    return json({
      ...defaultResponse,
      response: {
        raw: response,
        status: 200,
        message: !response.data ? 'No Data' : '',
      },
      total,
    });
  } catch (error) {
    return json({
      ...defaultResponse,
      response: {
        status: 404,
        message: error.response.data.message,
      },
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
  const renderMessageRef = useRef(null);
  const timelineProgressRef = useRef(null);

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [interfaceState, setInterfaceState] = useState({
    animation: 'idle',
    timeline: 0,
    rendering: false,
    download: null,
    output: '',
    frames: [],
    ratio: 1920,
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

  //   const intlNumberFormat = (number) => {
  //     console.log(number);
  //     return new Intl.NumberFormat().format(number);
  //     // return new Intl.NumberFormat('de-DE', { style: 'unit', currency: 'EUR' }).format(number);
  //   };

  useEffect(() => {
    if (data !== undefined && data.response.status === 200 && state === 'idle') {
      const duration = 6;
      const formattedTotal = new Intl.NumberFormat('en-US').format(data.total);
      tl.play();
      //   https://gsap.com/docs/v3/GSAP/UtilityMethods/snap()/
      tl.to(
        '#total',
        {
          duration: duration,
          //   textContent: data.total,
          snap: { textContent: 1 },
          ease: 'linear',
          onUpdate: () => {
            document.querySelector('#total').textContent = formattedTotal;
          },
        },
        '<'
      );
      // this adds a 3 second end frame
      tl.to('#watermark', { duration: 3, opacity: 1, ease: 'linear' });
      tl.to('#endframe-bg', { duration: 0.1, opacity: 1, ease: 'linear' });
      tl.to('#endframe-logo', { duration: 0.3, opacity: 1, ease: 'linear' });
      tl.to('#endframe-title', { duration: 0.3, opacity: 1, ease: 'linear' });
      tl.to('#endframe-url', { duration: 0.3, opacity: 1, ease: 'linear' });
      // this adds a 3 second end frame
      tl.to('#endframe-null', { duration: 3, opacity: 1, ease: 'linear' });

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
    const outputName = `${data.title}-${data.owner}-${data.repo}-${interfaceState.ratio}x1080`;

    setInterfaceState((prevState) => ({
      ...prevState,
      rendering: true,
      output: outputName,
    }));

    const generateVideo = async () => {
      try {
        const videoSrc = await createVideoFromFrames(
          data,
          renderMessageRef.current,
          chartCanvasRef.current,
          interfaceState.frames,
          data.config,
          interfaceState.ratio,
          outputName
        );

        setInterfaceState((prevState) => ({
          ...prevState,
          rendering: false,
          download: videoSrc,
        }));
      } catch (error) {
        console.error('Error:', error);
      }
    };

    generateVideo();
  };

  const handleRatio = (value) => {
    handleRevalidate();
    setInterfaceState((prevState) => ({
      ...prevState,
      animation: 'idle',
      ratio: value,
      download: null,
    }));
  };

  const handleRevalidate = () => {
    revalidator.revalidate();
  };

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  useEffect(() => {
    if (state === 'submitting' || state === 'loading') {
      setInterfaceState((prevState) => ({
        ...prevState,
        download: null,
      }));
    }
  }, [state]);

  const isDisabled =
    (state !== 'idle' && interfaceState.animation !== 'idle') ||
    state !== 'idle' ||
    interfaceState.animation !== 'idle' ||
    interfaceState.rendering;

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <AppSection>
          {data ? (
            <>
              {/* <pre>{JSON.stringify(data.response.raw, null, 2)}</pre> */}
              {/* <pre>{data.ticks.length}</pre> */}
            </>
          ) : null}
          <RatioFrame ratio={interfaceState.ratio}>
            <MainSvg ref={chartSvgRef} ratio={interfaceState.ratio}>
              {data && data.response.status === 200 && state === 'idle' ? (
                <>
                  <ChartHeadingElements
                    chartWidth={data.config.chartWidth}
                    paddingL={data.config.paddingL}
                    paddingR={data.config.paddingR}
                    color={data.config.color}
                    totalId='total'
                    owner={data.owner}
                    repo={data.repo}
                    title={data.title}
                  />

                  <Watermark chartWidth={data.config.chartWidth} chartHeight={data.config.chartHeight} />
                  <EndFrame chartWidth={data.config.chartWidth} chartHeight={data.config.chartHeight} />
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
              download={interfaceState.download}
              output={interfaceState.output}
            />
          </RatioFrame>
          <FormSidebar title='Stars'>
            <Form method='post' className='flex flex-col gap-4' autoComplete='off'>
              <div className='flex flex-col gap-2'>
                {/* <DatePicker label='End Date' name='to' onChange={handleDate} disabled={isDisabled} /> */}

                {/* <Select
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
                    { name: '275 Days', value: 275 },
                    { name: '364 Days', value: 364 },
                  ]}
                /> */}

                <label>
                  Owner
                  <input type='text' defaultValue='withAstro' name='owner' disabled={isDisabled} required />
                </label>
                <label>
                  Repository
                  <input type='text' defaultValue='astro' name='repo' disabled={isDisabled} required />
                </label>

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
