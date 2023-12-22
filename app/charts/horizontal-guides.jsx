const HorizontalGuides = ({ guides, chartWidth, chartHeight, paddingL, paddingR, paddingY }) => {
  return (
    <>
      {guides.map((_, index) => {
        const ratio = index / guides.length;
        const y = (chartHeight - paddingY) * ratio;

        return (
          <polyline
            key={index}
            points={`${paddingL},${y + paddingY}, ${chartWidth - paddingR}, ${y + paddingY}`}
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

export default HorizontalGuides;
