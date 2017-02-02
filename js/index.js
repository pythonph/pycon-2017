const d3 = window.d3
const speakersList = d3.select('.speakers-list')
const speakers = speakersList.selectAll('.speaker-info')

const cols = 5
const size = 128
const zf = 0.2
const {width, height} = speakersList.node().getBoundingClientRect()

const data = d3.range(speakers.size()).map((i) => {
  const col = i % cols
  const row = Math.floor(i / cols)
  const d = {
    x: (
      col * width / cols +
      (width / cols - size) / 2
    ),
    y: (
      Math.sin(col) * height / 10 +
      row * height / 3
    ),
    z: (
      zf *
      (
        Math.pow(-1, row) * col -
        (Math.pow(-1, row) < 1 ? 0 : cols)
      ) / cols
    )
  }
  return d
})

speakers.data(data)
  .style('transform', ({x, y, z}) => `translate3d(${x}px, ${y}px, ${z}px)`)
  .select('.label')
    .style('transform', d => `scale(${1 - d.z})`)

