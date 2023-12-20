import { useState, useRef, useEffect, useMemo } from 'react';
import { Form, useActionData, useRevalidator, useOutletContext, useNavigation } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { Octokit } from '@octokit/rest';
import { gsap } from 'gsap';

import * as DOMPurify from 'dompurify';

import AppLayout from '../../layouts/app-layout';
import DatePicker from '../../components/date-picker';
import Select from '../../components/select';
import ErrorAnnounce from '../../components/error-announce';
import Loading from '../../components/loading';
import PlayerControls from '../../components/player-controls';

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
    title: 'commits',
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
      color: '#2f81f7',
    },
  };

  console.log('defaultResponse.dates: ', defaultResponse.dates);

  try {
    // https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28
    const response = await octokit.paginate('GET /repos/{owner}/{repo}/commits', {
      owner: owner,
      repo: repo,
      per_page: 100,
      since: dateFrom,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    const { dateRange } = updateDateCount(response, generateDateArray(dateFrom, dateDiff), 'commit.committer.date');

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

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const isDisabled = (state !== 'idle' && interfaceState.animation !== 'idle') || interfaceState.rendering;

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section>
          <div className='flex mr-60'>
            {/* {data ? <pre>{JSON.stringify(data.response.raw, null, 2)}</pre> : null} */}
            <div className={`flex flex-col gap-4 grow mx-auto ${interfaceState.ratio === 1080 ? 'max-w-lg' : ''}`}>
              <svg
                ref={chartSvgRef}
                xmlns='http://www.w3.org/2000/svg'
                viewBox={`0 0 ${interfaceState.ratio} 1080`}
                style={{
                  background: '#0d1117',
                }}
              >
                {data && data.response.status === 200 && state === 'idle' ? (
                  <>
                    <defs>
                      <clipPath id='clip-mask'>
                        <rect ref={chartMaskRef} x='0' y='0' width={0} height={data.config.chartHeight} />
                      </clipPath>
                    </defs>

                    {data.legend.map((value, index) => {
                      const ratio = index / (data.legend.length - 1);
                      const y = (data.config._chartHeight - data.config.paddingY) * ratio + 10;
                      return (
                        <text
                          key={index}
                          x={data.config.paddingL - 50}
                          y={y + data.config.paddingY}
                          textAnchor='end'
                          style={{
                            fill: '#7d8590',
                            fontSize: '1.2rem',
                            fontFamily: 'Plus Jakarta Sans',
                            fontWeight: 600,
                          }}
                        >
                          {value}
                        </text>
                      );
                    })}

                    <rect
                      width={1}
                      height={data.config._chartHeight - data.config.paddingY}
                      x={data.config.paddingL - 20}
                      y={data.config.paddingY}
                      style={{
                        fill: '#272e36',
                      }}
                    />

                    {data.config.guides.map((_, index) => {
                      const ratio = index / data.config.guides.length;
                      const y = (data.config._chartHeight - data.config.paddingY) * ratio;

                      return (
                        <polyline
                          key={index}
                          points={`${data.config.paddingL},${y + data.config.paddingY}, ${
                            data.config.chartWidth - data.config.paddingR / 2
                          }, ${y + data.config.paddingY}`}
                          style={{
                            fill: 'none',
                            strokeWidth: 1,
                            stroke: '#272e36',
                          }}
                        />
                      );
                    })}

                    <g>
                      <text
                        x={data.config.paddingR / 2}
                        y={190}
                        style={{
                          fill: '#f0f6fc',
                          fontSize: '4rem',
                          fontFamily: 'Plus Jakarta Sans',
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      >
                        {data.title}
                      </text>
                      <text
                        x={data.config.paddingR / 2}
                        y={238}
                        style={{
                          fill: '#c9d1d9',
                          fontSize: '1.8rem',
                          fontFamily: 'Plus Jakarta Sans',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {data.owner} / {data.repo}
                      </text>

                      <text
                        id='total'
                        x={data.config.chartWidth - data.config.paddingR / 2}
                        y={188}
                        textAnchor='end'
                        style={{
                          fill: '#c9d1d9',
                          fontSize: '9rem',
                          fontFamily: 'Plus Jakarta Sans',
                          fontWeight: 900,
                        }}
                      >
                        0
                      </text>
                      <text
                        x={data.config.chartWidth - data.config.paddingR / 2 - 140}
                        y={238}
                        textAnchor='end'
                        style={{
                          fill: '#c9d1d9',
                          fontSize: '1.8rem',
                          fontFamily: 'Plus Jakarta Sans',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {data.dates.from} {data.dates.to}
                      </text>
                      <text
                        x={data.config.chartWidth - data.config.paddingR / 2}
                        y={238}
                        textAnchor='end'
                        style={{
                          fill: '#7d8590',
                          fontSize: '1.8rem',
                          fontFamily: 'Plus Jakarta Sans',
                          fontWeight: 400,
                          textTransform: 'capitalize',
                        }}
                      >
                        {`(${data.dates.diff} days)`}
                      </text>
                    </g>

                    <g>
                      <polyline
                        clipPath='url(#clip-mask)'
                        points={data.fills}
                        style={{
                          fill: data.config.color,
                          fillOpacity: 0.1,
                          stroke: 'none',
                        }}
                      />

                      <polyline
                        clipPath='url(#clip-mask)'
                        points={data.points}
                        style={{
                          fill: 'none',
                          strokeWidth: 3,
                          stroke: data.config.color,
                        }}
                      />

                      {data.ticks.map((tick, index) => {
                        const { date, x, y } = tick;

                        return (
                          <g
                            key={index}
                            className='date'
                            style={{
                              transform: 'translateX(-20px)',
                              opacity: 0,
                            }}
                          >
                            <text
                              x={x}
                              y={y}
                              textAnchor='middle'
                              style={{
                                fill: '#7d8590',
                                fontSize: '1.2rem',
                                fontFamily: 'Plus Jakarta Sans',
                                fontWeight: 600,
                                transform: 'rotate(45deg)',
                                transformBox: 'content-box',
                              }}
                            >
                              {date}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                    <text
                      x={data.config.chartWidth / 2}
                      y={data.config.chartHeight - 55}
                      textAnchor='middle'
                      style={{
                        fill: '#f0f6fc',
                        fontSize: '1.4rem',
                        fontFamily: 'Plus Jakarta Sans',
                        fontWeight: 600,
                      }}
                    >
                      www.punksquirrel.app
                    </text>
                  </>
                ) : null}
              </svg>

              {data && state === 'idle' ? (
                <>
                  <canvas
                    ref={chartCanvasRef}
                    className='hidden'
                    width={data.config.chartWidth}
                    height={data.config.chartHeight}
                    style={{
                      background: '#0d1117',
                    }}
                  />
                </>
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
              <div className='flex items-center justify-between bg-brand-surface-0 p-2'>
                <small ref={renderMessageRef} className='text-xs text-brand-text'></small>
                <div className='flex gap-4'>
                  <button
                    type='button'
                    className='inline-flex items-center px-3 py-2 rounded-md bg-brand-blue enabled:hover:brightness-110 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-1 disabled:text-brand-mid-gray'
                    onClick={handleRender}
                    disabled={
                      data === undefined ||
                      state !== 'idle' ||
                      interfaceState.animation !== 'idle' ||
                      interfaceState.timeline === 0 ||
                      interfaceState.rendering ||
                      data.response.status !== 200
                    }
                  >
                    Render
                  </button>
                </div>
              </div>
            </div>
            <div className='fixed bg-brand-surface-1 w-60 h-screen top-0 right-0 border-l border-l-brand-border overflow-auto'>
              <div className='flex flex-col gap-4 px-4 pt-24 pb-8'>
                <div>
                  <h1 className='mb-0 text-2xl'>Commits</h1>
                  <time className='block text-sm font-medium'>
                    {formatDate(dates.from)} &bull; {formatDate(dates.to)}{' '}
                  </time>
                </div>
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
                        // { name: '60 Days', value: 60 },
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
                  <button
                    type='submit'
                    className='inline-flex justify-center items-center px-3 py-2 rounded bg-brand-pink enabled:hover:brightness-110 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-2 disabled:text-brand-mid-gray h-8'
                    disabled={
                      state !== 'idle' ||
                      state !== 'idle' ||
                      interfaceState.animation !== 'idle' ||
                      interfaceState.rendering
                    }
                  >
                    {state === 'submitting' ? <Loading /> : 'Submit'}
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
