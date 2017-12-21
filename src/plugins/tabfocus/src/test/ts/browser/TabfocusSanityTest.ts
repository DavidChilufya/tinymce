import { Keys } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import TabfocusPlugin from 'tinymce/plugins/tabfocus/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.tabfocus.TabfocusSanityTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();
  TabfocusPlugin();

  var sAddInputs = function (editor) {
    return Step.sync(function () {
      var container = editor.getContainer();
      var input1 = document.createElement('input');
      input1.id = 'tempinput1';

      container.parentNode.insertBefore(input1, container);
    });
  };

  var sRemoveInputs = Step.sync(function () {
    var input1 = document.getElementById('tempinput1');

    input1.parentNode.removeChild(input1);
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyActions = TinyActions(editor);
    var tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      sAddInputs(editor),
      tinyApis.sFocus,
      Step.sync(function () {
        RawAssertions.assertEq('should be same', 'IFRAME', document.activeElement.nodeName);
      }),
      tinyActions.sContentKeystroke(Keys.tab(), {}),
      Waiter.sTryUntil('vait for focus',
        Step.sync(function () {
          var input = document.getElementById('tempinput1');
          RawAssertions.assertEq('should be same', input.outerHTML, document.activeElement.outerHTML);
        }), 100, 4000),
      sRemoveInputs
    ], onSuccess, onFailure);
  }, {
    plugins: 'tabfocus',
    tabfocus_elements: 'tempinput1',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});

