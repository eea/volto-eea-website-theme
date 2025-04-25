import cx from 'classnames';

const ContributorsViewWidget = ({ value, content, children, className }) => {
  const resolvedValue = content?.contributors_fullname || value || [];
  return resolvedValue ? (
    <span className={cx(className, 'array', 'widget')}>
      {resolvedValue.map((item, key) => (
        <>
          {key ? ', ' : ''}
          <span key={item.token || item.title || item}>
            {children
              ? children(item.title || item.token || item)
              : item.title || item.token || item}
          </span>
        </>
      ))}
    </span>
  ) : (
    ''
  );
};

export default ContributorsViewWidget;
