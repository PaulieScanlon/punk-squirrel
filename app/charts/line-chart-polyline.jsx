const LineChartPolyline = ({
  clipPathId,
  clipPathRectId,
  clipPathRectClass,
  chartHeight,
  fills,
  points,
  color,
  fillOpacity = 0.5,
}) => {
  return (
    <>
      <defs>
        <clipPath id={clipPathId}>
          <rect id={clipPathRectId} className={clipPathRectClass} x='0' y='0' width={0} height={chartHeight} />
        </clipPath>
        <linearGradient id='fill-gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
          <stop offset='0%' stop-color={color} stop-opacity={fillOpacity} />
          <stop offset='100%' stop-color={color} stop-opacity='0' />
        </linearGradient>
      </defs>
      <polyline
        clipPath={`url(#${clipPathId})`}
        points={fills}
        style={{
          fill: 'url(#fill-gradient)',
          fillOpacity: 1,
          stroke: 'none',
        }}
      />

      <polyline
        clipPath={`url(#${clipPathId})`}
        points={points}
        style={{
          fill: 'none',
          strokeWidth: 3,
          stroke: color,
        }}
      />
    </>
  );
};

export default LineChartPolyline;
