export const getItems = (data) => {
  return (data?.blocks_layout?.items || []).map((id) => [
    id,
    data.blocks?.[id],
  ]);
};
