export const calculateOffset = (
  total: number,
  limit: number,
  page: number,
): { totalPages: number; offset: number } => {
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  return {
    totalPages,
    offset,
  };
};
