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

  const { updatedDefaultDates } = updateDateCount(issues.data, generateDateArray());

  const firstSegment = updatedDefaultDates.slice(0, 7);
  const secondSegment = updatedDefaultDates.slice(7, 15);

  const maxValue = findMaxValue(updatedDefaultDates, 'count');
  const chartWidth = 1920;
  const chartHeight = 1080;
  const offsetY = 150;
  const paddingX = 140;
  const paddingY = 300;
  const guides = [...Array(8).keys()];

  const createProperties = (array) => {
    return array.map((entry, index) => {
      const { count } = entry;

      const ratio = index / (array.length - 1);
      const x = ratio * (chartWidth - paddingX) + paddingX / 2;
      const y = chartHeight - offsetY - (count / maxValue) * (chartHeight - (paddingY + offsetY));

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

    // first x
    // chartHeight - offsetY
    const starValues = [dataArray[0].split(',')[0], chartHeight - offsetY];

    // last x
    // chartHeight - offsetY
    const endValues = [dataArray[dataArray.length - 1].split(',')[0], chartHeight - offsetY];

    return [starValues, dataArray, endValues].toString();
  };

  return json({
    title: 'issues',
    owner: owner,
    repo: repo,
    state: state === 'open' ? 'opened' : 'closed',
    dates: {
      from: dateFrom,
      to: dateNow,
    },
    config: {
      chartWidth,
      chartHeight,
      offsetY,
      paddingX,
      paddingY,
      guides,
    },
    maxValue,
    insideSevenDays: {
      total: findTotalValue(firstSegment, 'count'),
      properties: createProperties(firstSegment),
      points: createPoints(createProperties(firstSegment)),
      fills: createFills(createProperties(firstSegment)),
      data: firstSegment,
    },
    outsideSevenDays: {
      total: findTotalValue(secondSegment, 'count'),
      properties: createProperties(secondSegment),
      points: createPoints(createProperties(secondSegment)),
      fills: createFills(createProperties(secondSegment)),
      data: secondSegment,
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

  const dateFrom = formatDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
  const dateNow = formatDate(new Date());

  // console.log(data);

  return (
    <>
      <AppLayout handleNav={handleNav} isNavOpen={isNavOpen} supabase={supabase} user={user}>
        <section className='flex flex-col gap-8'>
          <div>
            <h1 className='mb-0'>Issues</h1>
            <time className='text-sm text-brand-mid-gray font-medium'>
              {dateFrom} &bull; {dateNow}{' '}
            </time>
            <small>(14 Days)</small>
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

                    const offsetHeight = data.config.chartHeight - data.config.paddingY;

                    const y = offsetHeight - offsetHeight * ratio + data.config.offsetY;

                    return (
                      <polyline
                        key={index}
                        points={`${data.config.paddingX / 2},${y} ${
                          data.config.chartWidth - data.config.paddingX / 2
                        },${y}`}
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
                      x={70}
                      y={120}
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
                      x={70}
                      y={170}
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
                    <circle
                      cx={1840}
                      cy={160.5}
                      r={10}
                      style={{
                        fill: data.state === 'opened' ? '#238636' : '#f85149',
                      }}
                    />
                    <text
                      x={1810}
                      y={170}
                      textAnchor='end'
                      style={{
                        fill: data.state === 'opened' ? '#238636' : '#f85149',
                        fontSize: '1.6rem',
                        fontFamily: 'Plus Jakarta Sans',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {data.state}
                    </text>
                  </g>

                  <polyline
                    points={data.outsideSevenDays.fills}
                    style={{
                      fill: '#30363d',
                      fillOpacity: 0.1,
                      stroke: 'none',
                    }}
                  />

                  <polyline
                    points={data.outsideSevenDays.points}
                    style={{
                      fill: 'none',
                      strokeWidth: 4,
                      stroke: '#30363d',
                      strokeDasharray: 20,
                    }}
                  />

                  {data.outsideSevenDays.properties.map((property, index) => {
                    const { x, y } = property;
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r={14}
                          style={{
                            fill: '#0d1117',
                            strokeWidth: 4,
                            stroke: '#30363d',
                          }}
                        />
                      </g>
                    );
                  })}

                  <polyline
                    points={data.insideSevenDays.fills}
                    style={{
                      fill: '#ffd33d',
                      fillOpacity: 0.1,
                      stroke: 'none',
                    }}
                  />

                  <polyline
                    points={data.insideSevenDays.points}
                    style={{
                      fill: 'none',
                      strokeWidth: 3,
                      stroke: '#ffd33d',
                    }}
                  />

                  {data.outsideSevenDays.properties.map((property, index) => {
                    const { count, x, y } = property;
                    return (
                      <g key={index}>
                        {count > 0 ? (
                          <text
                            x={x}
                            y={y + 45}
                            textAnchor='middle'
                            style={{
                              fill: '#464d55',
                              fontSize: '1.6rem',
                              fontFamily: 'Plus Jakarta Sans',
                              fontWeight: 600,
                            }}
                          >
                            {`x${count}`}
                          </text>
                        ) : null}
                      </g>
                    );
                  })}

                  {data.insideSevenDays.properties.map((property, index) => {
                    const { count, x, y } = property;
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r={14}
                          style={{
                            fill: '#0d1117',
                            strokeWidth: 4,
                            stroke: '#ffd33d',
                          }}
                        />
                        {count > 0 ? (
                          <text
                            x={x}
                            y={y - 25}
                            textAnchor='middle'
                            style={{
                              fill: '#ffd33d',
                              fontSize: '1.6rem',
                              fontFamily: 'Plus Jakarta Sans',
                              fontWeight: 600,
                            }}
                          >
                            {`x${count}`}
                          </text>
                        ) : null}
                      </g>
                    );
                  })}
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
