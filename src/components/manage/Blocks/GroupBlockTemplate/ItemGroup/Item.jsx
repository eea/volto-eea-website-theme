import cx from 'classnames';
import { Item as UiItem, Icon } from 'semantic-ui-react';
import { serializeNodes } from '@plone/volto-slate/editor/render';

function Item({
  assetType,
  children,
  description,
  extra,
  header,
  icon,
  iconSize = 'big',
  theme,
  verticalAlign,
  image,
  imageSize = 'big',
  meta,
  isEditMode,
  className = '',
}) {
  return (
    <UiItem className={cx(theme)}>
      {assetType === 'image' && image && (
        <UiItem.Image
          src={`${image}/@@images/image/${imageSize}`}
          className={cx('ui', imageSize, verticalAlign, 'aligned')}
          alt={header || 'Item image'}
        />
      )}
      {assetType === 'icon' && icon && (
        <Icon
          className={cx(icon, theme, verticalAlign, 'aligned')}
          size={iconSize}
        />
      )}
      <UiItem.Content verticalAlign={verticalAlign}>
        {header && <UiItem.Header>{header}</UiItem.Header>}
        {meta && <UiItem.Meta>{meta}</UiItem.Meta>}
        {description && !isEditMode && (
          <UiItem.Description>{serializeNodes(description)}</UiItem.Description>
        )}
        {isEditMode && children}
        {extra && <UiItem.Extra>{extra}</UiItem.Extra>}
      </UiItem.Content>
    </UiItem>
  );
}

export default Item;
