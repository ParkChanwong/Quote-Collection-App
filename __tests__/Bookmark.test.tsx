import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { SaveButton } from '../src/components/CollectionContent';
import type { Quote } from '../src/api/quotes';

const quote: Quote = {
  id: 1,
  quote: '문장',
  personName: '인물',
  themeName: '용기',
  bookmark: true,
};

test('shows server bookmarks and allows a local false override', async () => {
  let renderer!: TestRenderer.ReactTestRenderer;
  const onToggleSave = jest.fn();
  await act(() => {
    renderer = TestRenderer.create(
      <SaveButton
        quote={quote}
        bookmarkOverrides={[]}
        onToggleSave={onToggleSave}
      />,
    );
  });
  expect(
    renderer.root.findAll(
      item =>
        item.props.accessibilityRole === 'button' &&
        typeof item.props.onPress === 'function',
    )[0].props.accessibilityState.selected,
  ).toBe(true);
  await act(() =>
    renderer.root
      .findAll(
        item =>
          item.props.accessibilityRole === 'button' &&
          typeof item.props.onPress === 'function',
      )[0]
      .props.onPress(),
  );
  expect(onToggleSave).toHaveBeenCalledWith(quote);
  await act(() =>
    renderer.update(
      <SaveButton
        quote={quote}
        bookmarkOverrides={[{ ...quote, bookmark: false }]}
        onToggleSave={onToggleSave}
      />,
    ),
  );
  expect(
    renderer.root.findAll(
      item =>
        item.props.accessibilityRole === 'button' &&
        typeof item.props.onPress === 'function',
    )[0].props.accessibilityState.selected,
  ).toBe(false);
  await act(() =>
    renderer.update(
      <SaveButton
        quote={{ ...quote, bookmark: false }}
        bookmarkOverrides={[]}
        onToggleSave={onToggleSave}
      />,
    ),
  );
  expect(
    renderer.root.findAll(
      item =>
        item.props.accessibilityRole === 'button' &&
        typeof item.props.onPress === 'function',
    )[0].props.accessibilityLabel,
  ).toBe('문장 저장');
  await act(() => renderer.unmount());
});
