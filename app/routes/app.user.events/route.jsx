import { useState, useRef, useEffect, useMemo } from 'react';
import { Form, useActionData, useRevalidator, useOutletContext, useNavigation } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { Octokit } from '@octokit/rest';
import { gsap } from 'gsap';

import * as DOMPurify from 'dompurify';

import AppLayout from '../../layouts/app-layout';
import AppSection from '../../components/app-section';
import FormSidebar from '../../components/form-sidebar';

import Select from '../../components/select';
import ErrorAnnounce from '../../components/error-announce';
import PlayerControls from '../../components/player-controls';
import SubmitButton from '../../components/submit-button';

import MainSvg from '../../charts/main-svg';
import RatioFrame from '../../charts/ratio-frame';
import ChartHeadingElements from '../../charts/chart-heading-elements';
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
import { findMaxValue } from '../../utils/find-max-value';
import { findTotalValue } from '../../utils/find-total-value';
import { calculateAnimationDuration } from '../../utils/calculate-animation-duration';
import { groupBy } from '../../utils/group-by';
import { GitHubEventTypes } from '../../utils/github-events';

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
  const username = body.get('username');
  const ratio = body.get('ratio');

  const chartWidth = ratio;
  const chartHeight = 1080;
  const offsetX = 60;
  const offsetY = 120;
  const _chartHeight = chartHeight - offsetY;
  const paddingL = 60;
  const paddingR = 60;
  const paddingY = 340;

  const gridCols = 3;
  const gridRows = 2;
  const gridColGap = 0;
  const gridRowGap = 80;

  const defaultResponse = {
    title: 'Events',
    username: username,
    config: {
      chartWidth,
      chartHeight,
      _chartHeight,
      offsetX,
      offsetY,
      paddingR,
      paddingL,
      paddingY,
    },
  };

  try {
    // https://docs.github.com/en/rest/activity/events?apiVersion=2022-11-28#list-events-for-the-authenticated-user
    const response = await octokit.request('GET /users/{username}/events', {
      username: username,
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const dateFrom = new Date(response.data[response.data.length - 1].created_at);
    const dateTo = new Date(response.data[0].created_at);
    const dateDiff = Math.ceil((dateTo - dateFrom) / (24 * 60 * 60 * 1000));

    const responseGrouped = groupBy(response.data, 'type');

    const eventsGrouped = Object.keys(responseGrouped)
      .map((object) => {
        const { name, color } = GitHubEventTypes[object];
        const dateRange = updateDateCount(responseGrouped[object], generateDateArray(dateFrom, dateDiff), 'created_at');
        return {
          name: name,
          color: color,
          total: findTotalValue(dateRange, 'count'),
          dateRange: dateRange,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    const eventsFlat = Object.keys(eventsGrouped)
      .map((_, index) => eventsGrouped[index].dateRange.flat())
      .flat();

    const maxValue = findMaxValue(eventsFlat, 'count');
    const total = findTotalValue(eventsFlat, 'count');

    const createGrid = (columns, rows, gridColGap, gridRowGap, width, height, offsetY, offsetX) => {
      const grid = Array.from({ length: rows }, (_, row) =>
        Array.from({ length: columns }, (_, col) => ({
          x: col * (width + gridColGap),
          y: row * (height + gridRowGap) + offsetY,
          width: width - offsetX,
        }))
      ).flat();

      return grid;
    };

    const grid = createGrid(
      gridCols,
      gridRows,
      gridColGap,
      gridRowGap,
      chartWidth / gridCols,
      _chartHeight / 2 / gridRows,
      offsetY,
      offsetX
    );

    const propertiesGrouped = Object.keys(eventsGrouped).map((_, index) => {
      const { name, color, total, dateRange } = eventsGrouped[index];
      const properties = createLineChartProperties(
        dateRange,
        chartWidth / gridCols,
        _chartHeight / gridRows,
        maxValue,
        paddingL,
        paddingR,
        paddingY
      );
      return {
        name: name,
        color: color,
        total: total,
        points: createLineChartPoints(properties),
        fills: createLineChartFills(properties, _chartHeight / gridRows),
        grid: grid[index],
      };
    });

    return json({
      ...defaultResponse,
      response: {
        raw: response.data,
        status: 200,
        message: !response.data.length ? 'No Data' : '',
      },
      maxValue,
      total,
      propertiesGrouped: propertiesGrouped,
      dates: {
        from: formatDate(dateFrom),
        to: formatDate(dateTo),
        diff: dateDiff,
      },
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

  useEffect(() => {
    if (data !== undefined && data.response.status === 200 && state === 'idle') {
      const totalDuration = 8;
      const maskDuration = 3;
      const maskStagger = 1;

      tl.play();
      tl.to(
        '.clip-mask-rect',
        { duration: maskDuration, width: data.config.chartWidth, stagger: maskStagger, ease: 'linear' },
        '<'
      );
      tl.to(
        '#total',
        { duration: totalDuration, textContent: data.total, snap: { textContent: 1 }, ease: 'linear' },
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
                  <ChartHeadingElements
                    chartWidth={data.config.chartWidth}
                    paddingL={data.config.paddingL}
                    paddingR={data.config.paddingR}
                    color={data.config.color}
                    totalId='total'
                    username={data.username}
                    title={data.title}
                    dates={data.dates}
                  />

                  {data.propertiesGrouped.map((property, index) => {
                    const {
                      name,
                      color,
                      points,
                      total,
                      fills,
                      grid: { x, y, width },
                    } = property;

                    return (
                      <g
                        key={index}
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                        }}
                      >
                        <text
                          x={0 + data.config.paddingL}
                          y={0 + data.config.paddingY}
                          textAnchor='start'
                          style={{
                            fill: '#c9d1d9',
                            fontSize: '1.8rem',
                            fontFamily: 'Plus Jakarta Sans',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {name}
                        </text>

                        <text
                          id={`sub-title-${index}`}
                          x={width}
                          y={0 + data.config.paddingY}
                          textAnchor='end'
                          style={{
                            fill: '#f0f6fc',
                            fontSize: '2.6rem',
                            fontFamily: 'Plus Jakarta Sans',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        >
                          {total}
                        </text>

                        <LineChartPolyline
                          clipPathId={`clip-mask-${index}`}
                          clipPathRectClass='clip-mask-rect'
                          chartHeight={data.config.chartHeight}
                          fills={fills}
                          points={points}
                          color={color}
                          fillOpacity={0.3}
                        />
                      </g>
                    );
                  })}

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
          <FormSidebar title='Events'>
            <Form method='post' className='flex flex-col gap-4' autoComplete='off'>
              <div className='flex flex-col gap-2'>
                <label>
                  Username
                  <input type='text' defaultValue='' name='username' disabled={isDisabled} required />
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
