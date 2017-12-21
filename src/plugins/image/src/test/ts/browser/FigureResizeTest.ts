import { Chain } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import { Guard } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { TinyDom } from '@ephox/mcagar';
import { Editor } from '@ephox/mcagar';
import { ApiChains } from '@ephox/mcagar';
import { UiChains } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.image.FigureResizeTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  ImagePlugin();

  var cGetBody = Chain.mapper(function (editor) {
    return TinyDom.fromDom(editor.getBody());
  });

  var cGetElementSize = Chain.mapper(function (elm) {
    var elmStyle = elm.dom().style;
    return { w: elmStyle.width, h: elmStyle.height };
  });

  var cDragHandleRight = function (px) {
    return Chain.op(function (input) {
      var dom = input.editor.dom;
      var target = input.resizeSE.dom();
      var pos = dom.getPos(target);

      dom.fire(target, 'mousedown', { screenX: pos.x, screenY: pos.y });
      dom.fire(target, 'mousemove', { screenX: pos.x + px, screenY: pos.y });
      dom.fire(target, 'mouseup');
    });
  };

  Pipeline.async({}, [
    Chain.asStep({}, [
      Editor.cFromSettings({
        plugins: 'image',
        toolbar: 'image',
        indent: false,
        image_caption: true,
        height: 400,
        skin_url: '/project/js/tinymce/skins/lightgray'
      }),
      UiChains.cClickOnToolbar('click image button', 'div[aria-label="Insert/edit image"]'),
      UiChains.cFillActiveDialog({
        src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        width: 100,
        height: 100,
        caption: true
      }),
      UiChains.cSubmitDialog(),
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cGetBody, 'editorBody'),
        // click the image, but expect the handles on the figure
        NamedChain.direct('editorBody', UiFinder.cFindIn('figure > img'), 'img'),
        NamedChain.direct('img', Mouse.cTrueClick, '_'),
        NamedChain.direct(NamedChain.inputName(), ApiChains.cAssertSelection([], 0, [], 1), '_'),
        NamedChain.direct('editorBody', Chain.control(
          UiFinder.cFindIn('#mceResizeHandlese'),
          Guard.tryUntil('wait for resize handlers', 100, 40000)
        ), '_'),
        // actually drag the handle to the right
        NamedChain.direct('editorBody', UiFinder.cFindIn('#mceResizeHandlese'), 'resizeSE'),
        NamedChain.write('_', cDragHandleRight(100)),
        NamedChain.direct('img', cGetElementSize, 'imgSize'),
        NamedChain.direct('imgSize', Assertions.cAssertEq('asserting image size after resize', { w: '200px', h: '200px' }), '_'),
        NamedChain.output('editor')
      ]),
      Editor.cRemove
    ])
  ], function () {
    success();
  }, failure);
});

