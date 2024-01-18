const VerticalGuides = ({ guides, chartWidth, chartHeight, paddingL, paddingR, paddingY }) => {
  return (
    <>
      {guides.map((_, index) => {
        const ratio = index / guides.length;
        const x = (chartWidth - paddingR * 2) * ratio;
        const y = chartHeight - paddingY;

        return (
          <polyline
            key={index}
            points={`${x + paddingL},${y - paddingY / 2}, ${x + paddingL}, ${chartHeight}`}
            style={{
              fill: 'none',
              strokeWidth: 1,
              stroke: '#272e36',
            }}
          />
        );
      })}
    </>
  );
};

export default VerticalGuides;
