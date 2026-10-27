export const projects = [
  { slug: 'sanya-surf', key: 'surf', price: 6800, deposit: 2000, tone: 'a' },
  { slug: 'wanning-dive', key: 'dive', price: 9200, deposit: 2800, tone: 'b' },
  { slug: 'haikou-culture', key: 'culture', price: 3800, deposit: 1200, tone: 'c' },
  { slug: 'lingshui-retreat', key: 'retreat', price: 12800, deposit: 3800, tone: 'd' },
]

export function getProjectBySlug(slug) {
  return projects.find((project) => project.slug === slug)
}
