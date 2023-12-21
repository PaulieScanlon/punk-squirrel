const LineChartPolyline = ({ fills, points, color }) => {
  return (
    <>
      <polyline
        clipPath='url(#clip-mask)'
        points={fills}
        style={{
          fill: color,
          fillOpacity: 0.1,
          stroke: 'none',
        }}
      />

      <polyline
        clipPath='url(#clip-mask)'
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
