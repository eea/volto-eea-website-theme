export const isItemAlreadySelected = ({
  data,
  item,
  normalize = (value) => value,
}) => {
  const selectedItems = Array.isArray(data) ? data : [];

  return selectedItems.some(
    (selectedItem) =>
      normalize(selectedItem?.['@id']) === normalize(item?.['@id']),
  );
};

export const isSelectableObjectBrowserItem = ({
  item,
  selectableTypes = [],
  onlyFolderishSelectable = false,
  maximumSelectionSize,
  data,
  mode,
  normalize = (value) => value,
}) => {
  if (onlyFolderishSelectable && !item?.is_folderish) {
    return false;
  }

  if (
    maximumSelectionSize &&
    Array.isArray(data) &&
    mode === 'multiple' &&
    maximumSelectionSize <= data.length
  ) {
    return isItemAlreadySelected({ data, item, normalize });
  }

  return selectableTypes.length > 0
    ? selectableTypes.indexOf(item?.['@type']) >= 0
    : true;
};

export const shouldCloseAfterObjectBrowserSelection = ({
  mode,
  maximumSelectionSize,
  currentLength = 0,
  isDeselecting = false,
}) => {
  let stopSelecting = mode !== 'multiple';

  if (isDeselecting && !stopSelecting) {
    stopSelecting =
      maximumSelectionSize > 0 && currentLength - 1 >= maximumSelectionSize;
  } else {
    stopSelecting =
      maximumSelectionSize > 0 && currentLength + 1 >= maximumSelectionSize;
  }

  return stopSelecting;
};
