/**
 * Diff field component.
 * @module components/manage/Diff/DiffField
 */

import React from 'react';
// import { diffWords as dWords } from 'diff';
import { join, map } from 'lodash';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-intl-redux';
import { createBrowserHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { useSelector } from 'react-redux';

import { Api } from '@plone/volto/helpers';
import configureStore from '@plone/volto/store';
import { DefaultView } from '@plone/volto/components/';
import { serializeNodes } from '@plone/volto-slate/editor/render';

import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';

/**
 * Enhanced diff words utility
 * @function diffWords
 * @param oneStr Field one
 * @param twoStr Field two
 */

/**
 * Diff field component.
 * @function DiffField
 * @param {*} one Field one
 * @param {*} two Field two
 * @param {Object} schema Field schema
 * @returns {string} Markup of the component.
 */
const DiffField = ({
  one,
  two,
  contentOne,
  contentTwo,
  view,
  schema,
  diffLib,
}) => {
  const language = useSelector((state) => state.intl.locale);
  const readable_date_format = {
    dateStyle: 'full',
    timeStyle: 'short',
  };
  const splitWords = (str) => {
    if (!str) return [];
    const splitedArray = [];
    let elementCurent = '';
    let insideTag = false;
    for (let i = 0; i < str.length; i++)
      if (str[i] === '<') {
        if (elementCurent) splitedArray.push(elementCurent);
        elementCurent = '<';
        insideTag = true;
      } else if (str[i] === '>') {
        elementCurent += '>';
        splitedArray.push(elementCurent);
        elementCurent = '';
        insideTag = false;
      } else if (str[i] === ' ' && insideTag === false) {
        elementCurent += ' ';
        splitedArray.push(elementCurent);
        elementCurent = '';
      } else elementCurent += str[i];
    if (elementCurent) splitedArray.push(elementCurent);
    return splitedArray;
  };

  const diffWords = (oneStr, twoStr) => {
    return diffLib.diffArrays(splitWords(oneStr), splitWords(twoStr));
  };

  let parts, oneArray, twoArray;
  if (schema.widget && schema.title !== 'Data sources and providers') {
    switch (schema.widget) {
      case 'richtext':
        parts = diffWords(one?.data, two?.data);
        break;
      case 'datetime':
        parts = diffWords(
          new Intl.DateTimeFormat(language, readable_date_format)
            .format(new Date(one))
            .replace('\u202F', ' '),
          new Intl.DateTimeFormat(language, readable_date_format)
            .format(new Date(two))
            .replace('\u202F', ' '),
        );
        break;
      case 'json': {
        const api = new Api();
        const history = createBrowserHistory();
        const store = configureStore(window.__data, history, api);
        parts = diffWords(
          ReactDOMServer.renderToStaticMarkup(
            <Provider store={store}>
              <ConnectedRouter history={history}>
                <DefaultView content={contentOne} />
              </ConnectedRouter>
            </Provider>,
          ),
          ReactDOMServer.renderToStaticMarkup(
            <Provider store={store}>
              <ConnectedRouter history={history}>
                <DefaultView content={contentTwo} />
              </ConnectedRouter>
            </Provider>,
          ),
        );
        break;
      }
      case 'slate': {
        const api = new Api();
        const history = createBrowserHistory();
        const store = configureStore(window.__data, history, api);
        parts = diffWords(
          ReactDOMServer.renderToStaticMarkup(
            <Provider store={store}>
              <ConnectedRouter history={history}>
                {serializeNodes(one)}
              </ConnectedRouter>
            </Provider>,
          ),
          ReactDOMServer.renderToStaticMarkup(
            <Provider store={store}>
              <ConnectedRouter history={history}>
                {serializeNodes(two)}
              </ConnectedRouter>
            </Provider>,
          ),
        );
        break;
      }
      case 'temporal': {
        if (one?.temporal?.length > 0 && two.temporal?.length > 0) {
          let firstString = one.temporal.reduce((acc, cur) => {
            return acc + cur?.label + ', ';
          }, '');
          firstString = firstString.substring(0, firstString.length - 2);
          let secondString = two.temporal.reduce((acc, cur) => {
            return acc + cur?.label + ', ';
          }, '');
          secondString = secondString.substring(0, secondString.length - 2);
          parts = diffWords(firstString, secondString);
        }
        break;
      }
      case 'geolocation': {
        if (one?.geolocation?.length > 0 && two.geolocation?.length > 0) {
          let firstString = one.geolocation.reduce((acc, cur) => {
            return acc + cur?.label + ', ';
          }, '');
          firstString = firstString.substring(0, firstString.length - 2);
          let secondString = two.geolocation.reduce((acc, cur) => {
            return acc + cur?.label + ', ';
          }, '');
          secondString = secondString.substring(0, secondString.length - 2);
          parts = diffWords(firstString, secondString);
        }
        break;
      }
      case 'textarea':
      default:
        parts = diffWords(one, two);
        break;
    }
  } else if (schema.title === 'Data sources and providers') {
    if (one?.data?.length > 0 && two.data?.length > 0) {
      let firstString = one.data.reduce((acc, cur) => {
        return acc + cur?.title + ', ' + cur?.organisation + '<br/>';
      }, '');
      firstString = firstString.substring(0, firstString.length - 2);
      let secondString = two.data.reduce((acc, cur) => {
        return acc + cur?.title + ', ' + cur?.organisation + '<br/>';
      }, '');
      secondString = secondString.substring(0, secondString.length - 2);
      parts = diffWords(firstString, secondString);
    }
  } else if (schema.type === 'object') {
    parts = diffWords(one?.filename || one, two?.filename || two);
  } else if (schema.type === 'array') {
    oneArray = (one || []).map((i) => i?.title || i);
    twoArray = (two || []).map((j) => j?.title || j);
    parts = diffWords(oneArray, twoArray);
  } else {
    parts = diffWords(one?.title || one, two?.title || two);
  }

  return (
    <Grid data-testid="DiffField">
      <Grid.Row>
        <Grid.Column width={12}>{schema.title}</Grid.Column>
      </Grid.Row>

      {view === 'split' && (
        <Grid.Row>
          <Grid.Column width={6} verticalAlign="top">
            <span
              dangerouslySetInnerHTML={{
                __html: join(
                  map(parts, (part) => {
                    let combined = (part.value || []).reduce((acc, value) => {
                      if (
                        part.removed &&
                        !value.includes('<') &&
                        !value.includes('>') &&
                        !value.includes('>') &&
                        !value.includes('</') &&
                        !value.includes('"') &&
                        !value.includes('src') &&
                        !value.includes('href') &&
                        !value.includes('=')
                      )
                        return acc + `<span class="deletion">${value}</span>`;
                      if (
                        part.added &&
                        !value.includes('<') &&
                        !value.includes('>') &&
                        !value.includes('>') &&
                        !value.includes('</') &&
                        !value.includes('"') &&
                        !value.includes('src') &&
                        !value.includes('href') &&
                        !value.includes('=')
                      )
                        return acc;
                      return acc + value;
                    }, '');
                    return combined;
                  }),
                  '',
                ),
              }}
            />
          </Grid.Column>
          <Grid.Column width={6} verticalAlign="top">
            <span
              dangerouslySetInnerHTML={{
                __html: join(
                  map(parts, (part) => {
                    let combined = (part.value || []).reduce((acc, value) => {
                      if (
                        part.added &&
                        !value.includes('<') &&
                        !value.includes('>') &&
                        !value.includes('>') &&
                        !value.includes('</') &&
                        !value.includes('"') &&
                        !value.includes('src') &&
                        !value.includes('href') &&
                        !value.includes('=')
                      )
                        return acc + `<span class="addition">${value}</span>`;
                      if (
                        part.removed &&
                        !value.includes('<') &&
                        !value.includes('>') &&
                        !value.includes('>') &&
                        !value.includes('</') &&
                        !value.includes('"') &&
                        !value.includes('src') &&
                        !value.includes('href') &&
                        !value.includes('=')
                      )
                        return acc;
                      return acc + value;
                    }, '');
                    return combined;
                  }),
                  '',
                ),
              }}
            />
          </Grid.Column>
        </Grid.Row>
      )}
      {view === 'unified' && (
        <Grid.Row>
          <Grid.Column width={16} verticalAlign="top">
            <span
              dangerouslySetInnerHTML={{
                __html: join(
                  map(parts, (part) => {
                    let combined = (part.value || []).reduce((acc, value) => {
                      if (
                        part.removed &&
                        !value.includes('<') &&
                        !value.includes('>') &&
                        !value.includes('>') &&
                        !value.includes('</') &&
                        !value.includes('"') &&
                        !value.includes('src') &&
                        !value.includes('href') &&
                        !value.includes('=')
                      )
                        return acc + `<span class="deletion">${value}</span>`;

                      if (
                        part.added &&
                        !value.includes('<') &&
                        !value.includes('>') &&
                        !value.includes('>') &&
                        !value.includes('</') &&
                        !value.includes('"') &&
                        !value.includes('src') &&
                        !value.includes('href') &&
                        !value.includes('=')
                      )
                        return acc + `<span class="addition">${value}</span>`;

                      return acc + value;
                    }, '');
                    return combined;
                  }),
                  '',
                ),
              }}
            />
          </Grid.Column>
        </Grid.Row>
      )}
    </Grid>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
DiffField.propTypes = {
  one: PropTypes.any.isRequired,
  two: PropTypes.any.isRequired,
  contentOne: PropTypes.any,
  contentTwo: PropTypes.any,
  view: PropTypes.string.isRequired,
  schema: PropTypes.shape({
    widget: PropTypes.string,
    type: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
};

export default injectLazyLibs('diffLib')(DiffField);
