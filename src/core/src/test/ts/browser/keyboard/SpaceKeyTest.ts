import { GeneralSteps } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { TinyActions } from '@ephox/mcagar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.SpaceKeyTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    var tinyApis = TinyApis(editor);
    var tinyActions = TinyActions(editor);

    Pipeline.async({}, [
      Logger.t('Press space at beginning of inline boundary', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>a <a href="#">b</a> c</p>'),
        tinyApis.sSetCursor([0, 1, 0], 0),
        tinyApis.sNodeChanged,
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
        tinyApis.sAssertContent('<p>a <a href="#">&nbsp;b</a> c</p>')
      ])),
      Logger.t('Press space at end of inline boundary', GeneralSteps.sequence([
        tinyApis.sFocus,
        tinyApis.sSetContent('<p>a <a href="#">b</a> c</p>'),
        tinyApis.sSetCursor([0, 1, 0], 1),
        tinyApis.sNodeChanged,
        tinyActions.sContentKeystroke(Keys.space(), {}),
        tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2),
        tinyApis.sAssertContent('<p>a <a href="#">b&nbsp;</a> c</p>')
      ]))
    ], onSuccess, onFailure);
  }, {
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});

