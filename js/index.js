const d3 = window.d3

const speakersList = d3.select('.speakers-list')
const speakers = speakersList.selectAll('.speaker-info')

const cols = 5
const rowHeight = 200
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
      row * rowHeight
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

function renderSchedule (root) {
  const range = JSON.parse(root.node().dataset.jsRange)
  const schedule = JSON.parse(root.node().dataset.jsSchedule)

  const svg = root.select('svg').append('g')
    .attr('transform', 'translate(50, 20)')
  const {width} = root.node().getBoundingClientRect()
  const availWidth = width - 70

  const y = d3.scaleTime()
    .domain([new Date(range[0]), new Date(range[range.length - 1])])
    .range([0, 960])

  const yAxis = d3.axisLeft(y).ticks(d3.timeHour)
  svg.append('g').call(yAxis)

  svg.append('g').selectAll('rect').data(schedule['Common']).enter().append('rect')
    .attr('width', availWidth)
    .attr('height', d => Math.abs(y(new Date(d.end)) - y(new Date(d.start))))
    .attr('x', 10)
    .attr('y', d => y(new Date(d.start)))
    .style('fill', d3.schemeCategory20c[0])

  root.append('div').classed('labels', true).selectAll('.label').data(schedule['Common']).enter().append('div')
    .classed('label', true)
    .style('transform', d => `translate(70px, ${24 + y(new Date(d.start))}px)`)
    .style('font-size', '80%')
    .style('width', availWidth + 'px')
    .text(d => d.topic)

  const tracks = Object.keys(schedule).filter(a => a !== 'Common')
  const trackWidth = availWidth / tracks.length

  tracks.forEach(function (track, i) {
    svg.append('g').selectAll('rect').data(schedule[track]).enter().append('rect')
      .attr('x', 10 + (i * trackWidth))
      .attr('y', d => y(new Date(d.start)))
      .attr('width', trackWidth)
      .attr('height', d => Math.abs(y(new Date(d.end)) - y(new Date(d.start))))
      .style('fill', d3.schemeCategory20c[i + 1])

    root.append('div').classed('labels', true).selectAll('.label').data(schedule[track]).enter().append('div')
      .classed('label', true)
      .style('transform', d => `translate(${70 + (i * trackWidth)}px, ${24 + y(new Date(d.start))}px)`)
      .style('font-size', '80%')
      .style('width', (trackWidth - 20) + 'px')
      .text(d => d.topic)
  })
}

renderSchedule(d3.select('[data-js-day-1]'))
renderSchedule(d3.select('[data-js-day-2]'))

