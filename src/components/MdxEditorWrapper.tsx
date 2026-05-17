import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertImage,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  headingsPlugin,
  imagePlugin,
  linkPlugin,
  listsPlugin,
  quotePlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiURL } from '../services/apiClient';
import { uploadCommunityImage } from '../services/uploadService';

const translations: Record<string, string> = {
  'toolbar.bold': 'Negrita',
  'toolbar.removeBold': 'Quitar negrita',
  'toolbar.italic': 'Cursiva',
  'toolbar.removeItalic': 'Quitar cursiva',
  'toolbar.underline': 'Subrayado',
  'toolbar.removeUnderline': 'Quitar subrayado',
  'toolbar.bulletedList': 'Lista con viñetas',
  'toolbar.numberedList': 'Lista numerada',
  'toolbar.checkList': 'Lista de verificación',
  'toolbar.blockTypes.paragraph': 'Párrafo',
  'toolbar.blockTypes.quote': 'Cita',
  'toolbar.blockTypes.heading': 'Encabezado {{level}}',
  'toolbar.blockTypeSelect.selectBlockTypeTooltip': 'Seleccionar tipo de bloque',
  'toolbar.blockTypeSelect.placeholder': 'Tipo de bloque',
  'toolbar.link': 'Crear enlace',
  'toolbar.image': 'Insertar imagen',
  'uploadImage.dialogTitle': 'Subir una imagen',
  'uploadImage.uploadInstructions': 'Subí una imagen desde tu dispositivo:',
  'uploadImage.addViaUrlInstructions': 'O agregá una imagen desde una URL:',
  'uploadImage.addViaUrlInstructionsNoUpload': 'Agregá una imagen desde una URL:',
  'uploadImage.autoCompletePlaceholder': 'Seleccioná o pegá la URL de la imagen',
  'uploadImage.alt': 'Texto alternativo:',
  'uploadImage.title': 'Título:',
  'uploadImage.width': 'Ancho:',
  'uploadImage.height': 'Alto:',
  'dialogControls.save': 'Guardar',
  'dialogControls.cancel': 'Cancelar',
  'createLink.url': 'URL',
  'createLink.urlPlaceholder': 'Seleccioná o pegá una URL',
  'createLink.text': 'Texto del enlace',
  'createLink.title': 'Título del enlace',
  'createLink.saveTooltip': 'Guardar URL',
  'createLink.cancelTooltip': 'Cancelar cambio',
  'contentArea.editableMarkdown': 'markdown editable',
  'imageEditor.deleteImage': 'Eliminar imagen',
  'imageEditor.editImage': 'Editar imagen',
  'linkPreview.edit': 'Editar URL del enlace',
  'linkPreview.copyToClipboard': 'Copiar al portapapeles',
  'linkPreview.copied': '¡Copiado!',
  'linkPreview.remove': 'Eliminar enlace',
};

function translation(
  key: string,
  defaultValue: string,
  interpolations?: Record<string, string>,
) {
  const value = translations[key] ?? defaultValue;
  if (!interpolations) {
    return value;
  }

  return Object.entries(interpolations).reduce(
    (result, [interpolationKey, interpolationValue]) =>
      result.replaceAll(`{{${interpolationKey}}}`, interpolationValue),
    value,
  );
}

interface Props {
  placeholder?: string;
  maxlength?: number;
  initialMarkdown?: string;
}

export default function MdxEditorWrapper({
  placeholder = 'Escribí acá...',
  maxlength,
  initialMarkdown = '',
}: Props) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const imageIdsRef = useRef<string[]>([]);

  const handleUploadImage = useCallback(async (file: File) => {
    const result = await uploadCommunityImage(file);
    imageIdsRef.current.push(result.id);

    return apiURL(`/community/uploads/images/${result.id}`);
  }, []);

  const handleChange = useCallback((nextMarkdown: string) => {
    if (typeof maxlength === 'number' && maxlength > 0 && nextMarkdown.length > maxlength) {
      return;
    }

    setMarkdown(nextMarkdown);
    document.dispatchEvent(
      new CustomEvent('mdx-editor-content-change', {
        detail: { markdown: nextMarkdown, imageIds: imageIdsRef.current },
      }),
    );
  }, [maxlength]);

  useEffect(() => {
    const handleGetContent = () => {
      document.dispatchEvent(
        new CustomEvent('mdx-editor-content-response', {
          detail: { markdown, imageIds: [...imageIdsRef.current] },
        }),
      );
    };

    const handleReset = () => {
      editorRef.current?.setMarkdown('');
      imageIdsRef.current = [];
      setMarkdown('');
      document.dispatchEvent(
        new CustomEvent('mdx-editor-content-change', {
          detail: { markdown: '', imageIds: [] },
        }),
      );
    };

    document.addEventListener('mdx-editor-get-content', handleGetContent);
    document.addEventListener('mdx-editor-reset', handleReset);

    return () => {
      document.removeEventListener('mdx-editor-get-content', handleGetContent);
      document.removeEventListener('mdx-editor-reset', handleReset);
    };
  }, [markdown]);

  return (
    <MDXEditor
      ref={editorRef}
      className="editor-modal-mdx"
      markdown={markdown}
      placeholder={placeholder}
      translation={translation}
      onChange={handleChange}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        linkPlugin(),
        imagePlugin({ imageUploadHandler: handleUploadImage }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <BlockTypeSelect />
              <CreateLink />
              <InsertImage />
            </>
          ),
        }),
      ]}
    />
  );
}
