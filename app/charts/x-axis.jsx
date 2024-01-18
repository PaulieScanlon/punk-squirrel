export const XAxis = ({ values, chartWidth, chartHeight, paddingY, paddingL, paddingR }) => {
  return (
    <>
      {values.map((value, index) => {
        const ratio = index / (values.length - 1);
        const x = (chartWidth - paddingL - paddingR * 2) * ratio;
        const y = chartHeight;
        return (
          <text
            key={index}
            x={x + paddingL}
            y={y + 45}
            textAnchor='start'
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

export default XAxis;
