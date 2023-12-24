const BarChartVertical = ({
  clipPathId,
  clipPathRectId,
  clipPathRectClass,
  chartHeight,
  bars,
  color,
  fillOpacity = 1,
}) => {
  return (
    <>
      <defs>
        <clipPath id={clipPathId}>
          <rect id={clipPathRectId} className={clipPathRectClass} x='0' y='0' width={0} height={chartHeight} />
        </clipPath>
      </defs>
      {bars.map((bar, index) => {
        const { x, y, width, height } = bar;

        return (
          <rect
            clipPath={`url(#${clipPathId})`}
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: color,
              fillOpacity: fillOpacity,
              stroke: 'none',
            }}
          />
        );
      })}
    </>
  );
};

export default BarChartVertical;
