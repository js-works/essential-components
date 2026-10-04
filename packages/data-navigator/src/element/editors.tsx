import { useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { DataNavigator } from '../api';
import * as reactEditors from '../core/view/ColumnEditors';
import type { DataNavigatorComponent } from '../react/api';
import type { ContentRenderer } from './content';

export { dateColumnEditor, editorOf, selectColumnEditor, textColumnEditor };

// The built-in editors of the element: opaque values for the app, and each one stands for an editor of the React
// component, which renders it (like the built-in filters, see filters.ts).
const builtIns = new WeakMap<object, DataNavigatorComponent.ColumnEditor<unknown>>();

function builtIn(editor: DataNavigatorComponent.ColumnEditor<unknown>): DataNavigator.BuiltInColumnEditor {
  const marker = Object.freeze({});

  builtIns.set(marker, editor);

  // The type brand exists only for the compiler: the marker is the key of the editor it stands for.
  return marker as DataNavigator.BuiltInColumnEditor;
}

function textColumnEditor(settings: DataNavigator.TextColumnEditorSettings = {}): DataNavigator.BuiltInColumnEditor {
  return builtIn(reactEditors.textColumnEditor(settings));
}

function selectColumnEditor(settings: DataNavigator.SelectColumnEditorSettings): DataNavigator.BuiltInColumnEditor {
  return builtIn(reactEditors.selectColumnEditor(settings));
}

function dateColumnEditor(settings: DataNavigator.DateColumnEditorSettings = {}): DataNavigator.BuiltInColumnEditor {
  return builtIn(reactEditors.dateColumnEditor(settings));
}

// A built-in editor becomes its React editor. An app's own editor function is called once, when the row goes into
// edit mode: its content (e.g. an input of the DOM) keeps its own state while the user types, and reports changes
// with `change`. A new render would replace it, and the input would lose its focus.
function editorOf<Row, C>(
  editor: DataNavigator.ColumnEditor<Row, C> | undefined,
  content: ContentRenderer,
): DataNavigatorComponent.ColumnEditor<Row> | undefined {
  if (editor === undefined) {
    return undefined;
  }

  if (typeof editor !== 'function') {
    // The built-in editors edit a value of any row type.
    return builtIns.get(editor) as DataNavigatorComponent.ColumnEditor<Row> | undefined;
  }

  return (props) => <OwnEditor props={props} editor={editor} content={content} />;
}

type OwnEditorProps<Row, C> = {
  props: DataNavigator.EditorProps<Row>;
  editor: (props: DataNavigator.EditorProps<Row>) => string | C;
  content: ContentRenderer;
};

function OwnEditor<Row, C>({ props, editor, content }: OwnEditorProps<Row, C>): ReactElement {
  // The latest props: `change` and `draft` of the first call must stay current for the content made then.
  const latest = useRef(props);

  useEffect(() => {
    latest.current = props;
  });

  const [made] = useState((): ReactNode => {
    const first = editor({
      ...props,
      change: (patch) => latest.current.change(patch),
    });

    return content(first);
  });

  return <>{made}</>;
}
