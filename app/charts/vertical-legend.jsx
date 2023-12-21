export const VerticalLegend = ({ values, chartHeight, paddingY, paddingL }) => {
  return (
    <>
      {values.map((value, index) => {
        const ratio = index / (values.length - 1);
        const y = (chartHeight - paddingY) * ratio + 10;
        return (
          <text
            key={index}
            x={paddingL - 50}
            y={y + paddingY}
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
    </>
  );
};

export default VerticalLegend;
