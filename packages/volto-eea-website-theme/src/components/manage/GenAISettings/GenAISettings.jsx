import { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ReactReduxContext } from 'react-redux';
import cx from 'classnames';
import { Modal } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import Field from '@plone/volto/components/manage/Form/Field';
import NumberWidget from '@plone/volto/components/manage/Widgets/NumberWidget';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import configurationSVG from '@plone/volto/icons/configuration.svg';
import config from '@plone/volto/registry';
import {
  buildLengthSettingsSchema,
  parseValidLength,
  requestGenAIControlpanel,
  updateGenAILengthSettings,
} from '@eeacms/volto-eea-website-theme/helpers/genAISettings';
import './genAISettings.less';

const messages = defineMessages({
  genaiSettings: {
    id: 'GenAI settings',
    defaultMessage: 'GenAI settings',
  },
  settingsModalTitle: {
    id: 'GenAI image length settings',
    defaultMessage: 'GenAI image length settings',
  },
  settingsLoadFailed: {
    id: 'Failed to load GenAI settings',
    defaultMessage: 'Failed to load GenAI settings',
  },
  settingsUnavailable: {
    id: 'GenAI settings are not available',
    defaultMessage: 'GenAI settings are not available',
  },
  settingsUpdated: {
    id: 'GenAI settings updated',
    defaultMessage: 'GenAI settings updated',
  },
  settingsSaveFailed: {
    id: 'Failed to update GenAI settings',
    defaultMessage: 'Failed to update GenAI settings',
  },
  cancel: {
    id: 'Cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'Save',
    defaultMessage: 'Save',
  },
});

const fallbackNumberWidgets = {
  vocabulary: {},
  views: { widget: {}, id: {} },
  widget: { integer: NumberWidget },
  id: {},
  choices: {},
  type: { integer: NumberWidget },
  default: NumberWidget,
};

if (config && !config.widgets) {
  config.widgets = fallbackNumberWidgets;
}

function showToast(type, content) {
  if (typeof toast[type] === 'function') {
    toast[type](
      <Toast
        info={type === 'info'}
        success={type === 'success'}
        error={type === 'error'}
        title={content}
        content={content}
      />,
    );
  }
}

const GenAISettings = ({
  isDisabled,
  disabled,
  className,
  canManageSettings: canManageProp,
}) => {
  const isTriggerDisabledExplicit = Boolean(isDisabled || disabled);
  const intl = useIntl();
  const isMountedRef = useRef(true);
  const reduxContext = useContext(ReactReduxContext);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const store = reduxContext?.store;
    if (!store?.subscribe) return undefined;
    return store.subscribe(() => {
      forceRender((n) => n + 1);
    });
  }, [reduxContext]);

  const canManageSettings = (() => {
    if (canManageProp !== undefined) return Boolean(canManageProp);
    if (!reduxContext?.store) return true;
    const actions = reduxContext.store.getState()?.actions?.actions?.user;
    if (Array.isArray(actions)) {
      return actions.some((action) => action?.id === 'plone_setup');
    }
    return true;
  })();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [schema, setSchema] = useState(() => buildLengthSettingsSchema());
  const [values, setValues] = useState({
    image_title_alt_max_length: '',
    image_description_max_length: '',
  });

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  const parsedTitleMax = parseValidLength(
    values.image_title_alt_max_length,
    schema.properties.image_title_alt_max_length?.minimum ?? 1,
  );
  const parsedDescMax = parseValidLength(
    values.image_description_max_length,
    schema.properties.image_description_max_length?.minimum ?? 1,
  );
  const isValid = parsedTitleMax !== null && parsedDescMax !== null;
  const isTriggerDisabled =
    isTriggerDisabledExplicit || loading || permissionDenied;

  const handleOpen = async () => {
    if (isTriggerDisabled) return;
    setLoading(true);
    try {
      const payload = await requestGenAIControlpanel();
      if (!isMountedRef.current) return;
      const trimmedSchema = buildLengthSettingsSchema(payload?.schema);
      const data = payload?.data || {};
      setSchema(trimmedSchema);
      setValues({
        image_title_alt_max_length:
          data.image_title_alt_max_length ??
          trimmedSchema.properties.image_title_alt_max_length?.default ??
          '',
        image_description_max_length:
          data.image_description_max_length ??
          trimmedSchema.properties.image_description_max_length?.default ??
          '',
      });
      setOpen(true);
    } catch (error) {
      if (!isMountedRef.current) return;
      const status = error?.status ?? error?.response?.status;
      if (status === 401 || status === 403) {
        setPermissionDenied(true);
        showToast('error', intl.formatMessage(messages.settingsUnavailable));
      } else {
        showToast('error', intl.formatMessage(messages.settingsLoadFailed));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (saving) return;
    setOpen(false);
  };

  const handleSave = async (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await updateGenAILengthSettings({
        image_title_alt_max_length: parsedTitleMax,
        image_description_max_length: parsedDescMax,
      });
      if (!isMountedRef.current) return;
      showToast('success', intl.formatMessage(messages.settingsUpdated));
      setOpen(false);
    } catch (error) {
      if (!isMountedRef.current) return;
      showToast('error', intl.formatMessage(messages.settingsSaveFailed));
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  const defaultFieldset = schema.fieldsets[0];

  if (!canManageSettings) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={cx(
          'ui tiny basic primary button image-ai-settings-button',
          className,
          {
            loading,
            disabled: isTriggerDisabled,
          },
        )}
        disabled={isTriggerDisabled}
        aria-label={intl.formatMessage(messages.genaiSettings)}
        title={intl.formatMessage(messages.genaiSettings)}
        onClick={handleOpen}
      >
        <Icon name={configurationSVG} size="16px" />
      </button>
      <Modal
        className="image-ai-settings-modal"
        role="dialog"
        aria-modal="true"
        size="tiny"
        open={open}
        closeIcon
        onClose={handleClose}
      >
        <Modal.Header>
          {intl.formatMessage(messages.settingsModalTitle)}
        </Modal.Header>
        <Modal.Content>
          <form className="ui form" onSubmit={handleSave} noValidate>
            {defaultFieldset.fields.map((fieldId) => {
              const fieldProps = schema.properties[fieldId] || {};
              return (
                <Field
                  {...fieldProps}
                  key={fieldId}
                  id={fieldId}
                  fieldSet={defaultFieldset.id}
                  value={values[fieldId]}
                  required={schema.required.includes(fieldId)}
                  widgets={config.widgets || fallbackNumberWidgets}
                  onChange={(changedId, nextValue) =>
                    setValues((current) => ({
                      ...current,
                      [changedId]: nextValue,
                    }))
                  }
                />
              );
            })}
          </form>
        </Modal.Content>
        <Modal.Actions>
          <button
            type="button"
            className="ui button"
            disabled={saving}
            onClick={handleClose}
          >
            {intl.formatMessage(messages.cancel)}
          </button>
          <button
            type="button"
            className={cx('ui primary button', {
              loading: saving,
              disabled: !isValid || saving,
            })}
            disabled={!isValid || saving}
            onClick={handleSave}
          >
            {intl.formatMessage(messages.save)}
          </button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

GenAISettings.propTypes = {
  isDisabled: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  canManageSettings: PropTypes.bool,
};

export { GenAISettings, GenAISettings as GenAILengthSettings };
export default GenAISettings;
