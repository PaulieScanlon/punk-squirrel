import { useState } from 'react';
import { Form, useActionData, useOutletContext } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
// import { Octokit } from 'octokit';
import { Octokit } from '@octokit/rest';

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

  if (!session) {
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
  const total = dateRange.reduce((total, item) => total + item.count, 0);
  const chartWidth = 1920;
  const chartHeight = 1080;
  const offsetY = 180;
  const _chartHeight = chartHeight - offsetY;
  const paddingX = 150;
  const paddingY = 320;
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
    return array
      .map((point) => {
        const { x, y } = point;
        return `${x},${y}`;
      })
      .toString();
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

const Page = () => {
  const { supabase, user } = useOutletContext();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const data = useActionData();

  const handleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const dateFrom = formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const dateNow = formatDate(new Date());

  if (data) {
    console.log(data);
    // console.log(data.outsideSevenDays.dates.from, data.outsideSevenDays.dates.to);
  }

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section className='flex flex-col gap-8'>
          <div>
            <h1 className='mb-0'>Issues</h1>
            <time className='text-sm  font-medium'>
              {dateFrom} &bull; {dateNow}{' '}
            </time>
            <small className='text-brand-mid-gray'>{data ? `(${data.dates.diff} days)` : ''}</small>
          </div>
          <Form method='post' className='flex flex-col md:flex-row items-start md:items-end gap-4'>
            <input hidden name='dateFrom' defaultValue={dateFrom} />
            <input hidden name='dateNow' defaultValue={dateNow} />
            <div className='flex flex-col md:flex-row gap-2'>
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
            </div>
            <button
              type='submit'
              className='inline-flex items-center px-3 py-2 rounded bg-brand-blue hover:brightness-110 transition-all duration-300 font-medium text-xs'
            >
              Submit
            </button>
          </Form>

          <div className='md:w-9/12'>
            <svg
              id='svg'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 1920 1080'
              style={{
                background: '#0d1117',
              }}
            >
              {data ? (
                <>
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
                      {data.owner} • {data.repo}
                    </text>

                    <text
                      x={data.config.chartWidth - data.config.paddingX / 2}
                      y={188}
                      textAnchor='end'
                      style={{
                        fill: '#c9d1d9',
                        fontSize: '9rem',
                        fontFamily: 'Plus Jakarta Sans',
                        fontWeight: 900,
                      }}
                    >
                      {data.total}
                    </text>
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
                      {data.dates.from} • {data.dates.to}
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
                      points={data.fills}
                      style={{
                        fill: data.config.color,
                        fillOpacity: 0.1,
                        stroke: 'none',
                      }}
                    />

                    <polyline
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
                        <g key={index}>
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

                    {data.ticks.map((tick) => {
                      const { date, x, y } = tick;

                      return (
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
                      );
                    })}
                  </g>
                </>
              ) : null}
            </svg>
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
