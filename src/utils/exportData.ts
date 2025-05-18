export function exportToCSV<T extends Record<string, unknown>>(data: T[], filename: string) {
  if (!data.length) return // Проверка на пустой массив
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','), // Заголовки
    ...data.map((row) =>
      headers
        .map((key) => {
          const value = row[key]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : String(value)
        })
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
