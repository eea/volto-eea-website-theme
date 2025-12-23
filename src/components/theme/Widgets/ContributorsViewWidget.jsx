import cx from 'classnames';

const ContributorsViewWidget = ({ value, content, children, className }) => {
  const resolvedValue = content?.contributors_fullname || value || [];
  return resolvedValue ? (
    <span className={cx(className, 'array', 'widget')}>
      {resolvedValue.map((item, index) => {
        const label = item?.title || item?.token || item;
        const key = `${label}-${index}`;
        return (
          <span key={key}>
            {index ? ', ' : ''}
            {children ? children(label) : label}
          </span>
        );
      })}
    </span>
  ) : (
    ''
  );
};

export default ContributorsViewWidget;
