import { useState, useRef, useEffect } from 'react';
import { Form, useActionData, useOutletContext, useNavigation } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { Octokit } from '@octokit/rest';
import { gsap } from 'gsap';
import * as DOMPurify from 'dompurify';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

import AppLayout from '../layouts/app-layout';

import { supabaseServer } from '../supabase.server';

import { generateDateArray } from '../utils/generate-date-array';
import { updateDateCount } from '../utils/update-date-count';
import { formatDate } from '../utils/format-date';
import { formatTick } from '../utils/format-tick';
import { findMaxValue } from '../utils/find-max-value';
import { findTotalValue } from '../utils/find-total-value';

export const action = async ({ request }) => {
  const { supabaseClient } = await supabaseServer(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session || !session.provider_token) {
    // console.log('Session: ', session);
    // console.log('Authenticated User: ', await octokit.users.getAuthenticated());
    await supabaseClient.auth.signOut();
    throw redirect('/');
  }

  const octokit = new Octokit({
    auth: session.provider_token,
  });

  // console.log('Provided Token:', await octokit.auth());

  const body = await request.formData();
  const owner = body.get('owner');
  const repo = body.get('repo');
  const state = body.get('state');
  const ratio = body.get('ratio');
  const dateFrom = body.get('dateFrom');
  const dateNow = body.get('dateNow');
  const dateDiff = Math.round((new Date(dateNow) - new Date(dateFrom)) / (1000 * 60 * 60 * 24));

  // https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28
  const issues = await octokit.request('GET /repos/{owner}/{repo}/issues', {
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

  const { dateRange } = updateDateCount(issues.data, generateDateArray(dateDiff));

  const maxValue = findMaxValue(dateRange, 'count');
  const total = findTotalValue(dateRange, 'count');
  const chartWidth = ratio;
  const chartHeight = 1080;
  const offsetY = 220;
  const _chartHeight = chartHeight - offsetY;
  const paddingX = 150;
  const paddingY = 340;
  const guides = [...Array(8).keys()];

  const createProperties = (array) => {
    return array.map((entry, index) => {
      const { count } = entry;

      const x_ratio = index / (array.length - 1);
      const y_ratio = count / maxValue;
      const x = x_ratio * (chartWidth - paddingX) + paddingX / 2;
      const y = _chartHeight - y_ratio * (_chartHeight - paddingY);

      return {
        count,
        x,
        y,
      };
    });
  };

  const createPoints = (array) => {
    return array.map((point) => {
      const { x, y } = point;
      return `${x},${y}`;
      // return { x, y };
    });
    // .toString();
  };

  const createFills = (array) => {
    const dataArray = array.map((point) => {
      const { x, y } = point;
      return `${x},${y}`;
    });

    // first x, chartHeight - offsetY
    const starValues = [dataArray[0].split(',')[0], _chartHeight];
    // last x, chartHeight + paddingY * 2
    const endValues = [dataArray[dataArray.length - 1].split(',')[0], _chartHeight];

    return [starValues, dataArray, endValues].toString();
  };

  const createTicks = (array) => {
    return array.map((tick, index) => {
      const { date } = tick;

      const x_ratio = index / (array.length - 1);
      const x = x_ratio * (chartWidth - paddingX) + paddingX / 2;
      const y = _chartHeight;

      return {
        date: formatTick(date),
        x: x + 20,
        y: y + 45,
      };
    });
  };

  return json({
    title: 'issues',
    owner,
    repo,
    state,
    dates: {
      from: dateFrom,
      to: dateNow,
      diff: dateDiff,
    },
    maxValue,
    total,
    ticks: createTicks(dateRange),
    properties: createProperties(dateRange),
    points: createPoints(createProperties(dateRange)),
    fills: createFills(createProperties(dateRange)),
    data: dateRange,
    config: {
      chartWidth,
      chartHeight,
      _chartHeight,
      offsetY,
      paddingX,
      paddingY,
      guides,
      color: state === 'open' ? '#3fb950' : '#f85149',
    },
  });
};

export const loader = async ({ request }) => {
  const { supabaseClient, headers } = await supabaseServer(request);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    throw redirect('/');
  }

  return json({
    headers,
  });
};

const Page = () => {
  // const ffmpegRef = useRef(new FFmpeg());
  const { supabase, user } = useOutletContext();

  const { state } = useNavigation();

  const data = useActionData();

  const chartCanvasRef = useRef(null);
  const chartSvgRef = useRef(null);
  const chartMaskRef = useRef(null);
  const renderMessageRef = useRef(null);

  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [animationFrames, setAnimationFrames] = useState([]);
  const [canvasFrames, setCanvasFrames] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [ratio, setRatio] = useState(1920);

  const dateFrom = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const dateNow = formatDate(new Date());

  let tempAnimationFrames = [];
  let tempCanvasFrames = [];

  useEffect(() => {
    if (data && state === 'idle') {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
      setIsAnimationComplete(false);
    }
  }, [data, state]);

  useEffect(() => {
    const chartMask = chartMaskRef.current;

    let tl = gsap.timeline({
      paused: true,
      onUpdate: () => {
        const svg = DOMPurify.sanitize(chartSvgRef.current);
        const src = `data:image/svg+xml;base64;utf8,${btoa(svg)}`;
        tempAnimationFrames.push(src);
      },
      onComplete: async () => {
        setIsAnimationComplete(true);
        setAnimationFrames(tempAnimationFrames);
      },
    });
    if (isLoaded) {
      const duration = 6;
      const stagger = (duration - 1) / data.points.length;
      tl.seek(0);
      tl.play();
      tl.to(chartMask, { duration: duration, width: data.config.chartWidth, ease: 'sine.out' });
      tl.to(
        '.value',
        { duration: 0.3, transform: 'translateY(0px)', opacity: 1, stagger: stagger, ease: 'sine.out' },
        '<'
      );
      tl.to('.date', { duration: 0.3, transform: 'translateX(0px)', opacity: 1, stagger: 0.16, ease: 'sine.out' }, '<');
      tl.to('#total', { duration: 1, textContent: data.total, snap: { textContent: 1 }, ease: 'sine.out' }, '>-1');
    } else {
      tl.clear();
    }
  }, [isLoaded]);

  const loadFFmpeg = async () => {
    const ffmpeg = new FFmpeg();
    console.log(ffmpeg);
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm';

    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  };

  // const renderVideo = async () => {
  //   console.log('renderVideo');
  //   const canvas = chartCanvasRef.current;
  //   const ctx = canvas.getContext('2d');

  //   let inc = 0;

  //   const createRasterizedImage = () => {
  //     const virtualImage = new Image();
  //     virtualImage.src = animationFrames[inc];

  //     virtualImage.addEventListener('load', async () => {
  //       renderMessageRef.current.innerHTML = `Preparing frame: ${inc} of ${animationFrames.length - 1}`;
  //       ctx.clearRect(0, 0, data.config.chartWidth, data.config.chartHeight);
  //       ctx.drawImage(virtualImage, 0, 0, data.config.chartWidth, data.config.chartHeight);
  //       tempCanvasFrames.push(canvas.toDataURL('image/jpeg'));
  //       inc++;
  //       if (inc < animationFrames.length) {
  //         createRasterizedImage();
  //       } else {
  //         console.log('onComplete');
  //         setCanvasFrames(tempCanvasFrames);
  //         const ffmpeg = new FFmpeg();
  //         console.log('ffmpeg: ', ffmpeg);

  //         const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm';

  //         await ffmpeg.load({
  //           coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
  //           wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  //           // coreURL: await toBlobURL('/@ffmpeg/core/dist/esm/ffmpeg-core.js', 'text/javascript'),
  //           // wasmURL: await toBlobURL('/@ffmpeg/core/dist/esm/ffmpeg-core.wasm', 'application/wasm'),
  //         });
  //         //   ffmpeg.on('progress', ({ progress, time }) => {
  //         //     console.log(`Transcoding: ${progress}% | ${time / 1000000} s`);
  //         //   });
  //       }
  //     });

  //     virtualImage.addEventListener('error', (error) => {
  //       console.log('virtualImage.error: ', error);
  //     });
  //   };

  //   createRasterizedImage();
  // };

  const handleRatio = (event) => {
    setIsLoaded(false);
    setIsAnimationComplete(false);
    setRatio(event.target.value);
  };

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section className=''>
          <div className='flex mr-60'>
            <div className={`flex flex-col gap-4 grow ${ratio === '1080' ? 'px-32' : null}`}>
              <canvas
                ref={chartCanvasRef}
                className='hidden'
                width={isLoaded ? data.config.chartWidth : '100%'}
                height={isLoaded ? data.config.chartHeight : 'auto'}
              />
              <svg
                ref={chartSvgRef}
                xmlns='http://www.w3.org/2000/svg'
                viewBox={`0 0 ${ratio} 1080`}
                style={{
                  background: '#0d1117',
                }}
              >
                {isLoaded ? (
                  <>
                    <defs>
                      <clipPath id='clip-mask'>
                        <rect ref={chartMaskRef} x='0' y='0' width={0} height={data.config.chartHeight} />
                      </clipPath>
                    </defs>

                    {data.config.guides.map((_, index) => {
                      const ratio = index / data.config.guides.length;
                      const y = (data.config._chartHeight - data.config.paddingY) * ratio;

                      return (
                        <polyline
                          key={index}
                          points={`${data.config.paddingX / 2},${y + data.config.paddingY}, ${
                            data.config.chartWidth - data.config.paddingX / 2
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
                      <rect
                        x={data.config.paddingX / 2}
                        y={75}
                        width={120}
                        height={40}
                        rx={18}
                        ry={18}
                        style={{
                          fill: data.config.color,
                          fillOpacity: 0.2,
                          strokeWidth: 2,
                          stroke: data.config.color,
                        }}
                      />
                      <text
                        x={data.config.paddingX / 2 + 59}
                        y={103}
                        textAnchor='middle'
                        style={{
                          fill: data.config.color,
                          fontSize: '1.4rem',
                          fontFamily: 'Plus Jakarta Sans',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                        }}
                      >
                        {data.state}
                      </text>

                      <text
                        x={data.config.paddingX / 2}
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
                        x={data.config.paddingX / 2}
                        y={238}
                        style={{
                          fill: '#c9d1d9',
                          fontSize: '1.8rem',
                          fontFamily: 'Plus Jakarta Sans',
                          fontWeight: 400,
                          textTransform: 'capitalize',
                        }}
                      >
                        {data.owner} {data.repo}
                      </text>

                      <text
                        id='total'
                        x={data.config.chartWidth - data.config.paddingX / 2}
                        y={188}
                        textAnchor='end'
                        style={{
                          fill: '#c9d1d9',
                          fontSize: '9rem',
                          fontFamily: 'Plus Jakarta Sans',
                          fontWeight: 900,
                        }}
                      ></text>
                      <text
                        x={data.config.chartWidth - data.config.paddingX / 2 - 140}
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
                        x={data.config.chartWidth - data.config.paddingX / 2}
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

                      {data.properties.map((property, index) => {
                        const { x, y, count } = property;
                        return (
                          <g
                            key={index}
                            className='value'
                            style={{
                              opacity: 0,
                              transform: 'translateY(20px)',
                            }}
                          >
                            {count > 0 ? (
                              <>
                                <circle
                                  cx={x}
                                  cy={y - 10}
                                  r={20}
                                  style={{
                                    fill: '#161b22',
                                    stroke: data.config.color,
                                    strokeWidth: 3,
                                  }}
                                />
                                <text
                                  x={x}
                                  y={y - 2}
                                  textAnchor='middle'
                                  style={{
                                    fill: data.config.color,
                                    fontSize: '1.2rem',
                                    fontFamily: 'Plus Jakarta Sans',
                                    fontWeight: 600,
                                  }}
                                >
                                  {count}
                                </text>
                              </>
                            ) : null}
                          </g>
                        );
                      })}

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
                                fill: '#464d55',
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
                      y={data.config.chartHeight - 60}
                      textAnchor='middle'
                      style={{
                        fill: '#464d55',
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
              <div className='flex justify-between'>
                {data ? (
                  <>
                    <small ref={renderMessageRef} className='text-xs text-brand-mid-gray'></small>
                    <div>
                      <button
                        type='button'
                        className='inline-flex items-center px-3 py-2 rounded-md bg-brand-blue hover:brightness-110 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-2 disabled:text-brand-mid-gray'
                        onClick={loadFFmpeg}
                        disabled={!isAnimationComplete || !isLoaded}
                      >
                        Render
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            <div className='fixed bg-brand-surface-1 w-60 h-screen top-0 right-0 border-l border-l-brand-border'>
              <div className='flex flex-col gap-4 px-4 pt-24'>
                <div>
                  <h1 className='mb-0 text-2xl'>Issues</h1>
                  <time className='block text-sm font-medium'>
                    {dateFrom} &bull; {dateNow}{' '}
                  </time>
                  <small className='text-brand-mid-gray'>{data ? `(${data.dates.diff} days)` : '( days)'}</small>
                </div>
                <Form method='post' className='flex flex-col gap-4'>
                  <input hidden name='dateFrom' defaultValue={dateFrom} />
                  <input hidden name='dateNow' defaultValue={dateNow} />
                  <div className='flex flex-col gap-2'>
                    <label>
                      Owner
                      <input type='text' defaultValue='remix-run' placeholder='remix-run' name='owner' />
                    </label>
                    <label>
                      Repository
                      <input type='text' defaultValue='remix' placeholder='remix' name='repo' />
                    </label>
                    <label>
                      State
                      <select name='state'>
                        <option defaultChecked>open</option>
                        <option>closed</option>
                      </select>
                    </label>
                    <label>
                      Ratio
                      <select name='ratio' onChange={handleRatio}>
                        <option defaultChecked value={1920}>
                          16:9
                        </option>
                        <option value={1080}>1:1</option>
                      </select>
                    </label>
                  </div>
                  <button
                    type='submit'
                    className='inline-flex justify-center items-center px-3 py-2 rounded bg-brand-blue hover:brightness-110 transition-all duration-300 font-medium text-xs disabled:bg-brand-surface-2 disabled:text-brand-mid-gray'
                    disabled={state !== 'idle'}
                  >
                    Submit
                  </button>
                </Form>
              </div>
            </div>
          </div>
          {data ? (
            <>
              {/* <div className='grid grid-cols-2 gap-4'>
                <pre>{JSON.stringify(data.insideSevenDays, null, 2)}</pre>
                <pre>{JSON.stringify(data.outsideSevenDays, null, 2)}</pre>
              </div> */}
              {/* <pre>{JSON.stringify(data.issues.data, null, 2)}</pre> */}
              {/* <pre>{JSON.stringify(data.groupedIssues, null, 2)}</pre> */}
            </>
          ) : null}
        </section>
      </AppLayout>
    </>
  );
};

export default Page;
