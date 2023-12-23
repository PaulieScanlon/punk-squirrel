const LineChartPolyline = ({ clipPathId, clipPathRectId, clipPathRectClass, chartHeight, fills, points, color }) => {
  return (
    <>
      <defs>
        <clipPath id={clipPathId}>
          <rect id={clipPathRectId} className={clipPathRectClass} x='0' y='0' width={0} height={chartHeight} />
        </clipPath>
      </defs>
      <polyline
        clipPath={`url(#${clipPathId})`}
        points={fills}
        style={{
          fill: color,
          fillOpacity: 0.1,
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
