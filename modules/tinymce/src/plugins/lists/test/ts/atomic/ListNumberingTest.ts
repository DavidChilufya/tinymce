import { Assert, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, OptionalInstances } from '@ephox/katamari';
import fc from 'fast-check';
import { parseStartValue, parseDetail, ListDetail } from 'tinymce/plugins/lists/core/ListNumbering';

describe('atomic.tinymce.plugins.lists.core.ListNumberingTest', () => {
  const tOptional = OptionalInstances.tOptional;

  const check = (startValue: string, expectedDetail: Optional<ListDetail>) => {
    const actualDetail = parseStartValue(startValue);

    Assert.eq('Should convert start value to expected detail', expectedDetail, actualDetail, tOptional());

    actualDetail.map(parseDetail).each((initialStartValue) => {
      Assert.eq('Should convert detail back to initial start value', startValue, initialStartValue);
    });
  };

  it('TINY-6891: Converts number -> numbered list type detail -> back to initial number', () => check(
    '1',
    Optional.some({ start: '1', listStyleType: false })
  ));

  it('TINY-6891: Converts lowercase letter -> lower-alpha list type detail -> back to initial lowercase letter', () => check(
    'a',
    Optional.some({ start: '1', listStyleType: 'lower-alpha' })
  ));

  it('TINY-6891: Converts uppercase letters -> upper-alpha list type detail -> back to initial uppercase letters', () => {
    check(
      'A',
      Optional.some({ start: '1', listStyleType: 'upper-alpha' })
    );
    check(
      'ABCD',
      Optional.some({ start: '19010', listStyleType: 'upper-alpha' })
    );
  });

  it('TINY-6891: Does not convert if the start value is ambiguous', () => {
    check(
      'ABC123',
      Optional.none()
    );
    check(
      'aB',
      Optional.none()
    );
  });

  it('TINY-6891: Should be able to convert to and from numbers/list numbering', () => {
    const arbitrary = Arr.map([
      fc.mapToConstant({ num: 26, build: (v) => String.fromCharCode(65 + v) }),
      fc.mapToConstant({ num: 26, build: (v) => String.fromCharCode(97 + v) }),
      fc.mapToConstant({ num: 10, build: (v) => v.toString() })
    ], (c) => fc.stringOf(c, 1, 5));

    fc.assert(fc.property(
      fc.oneof(...arbitrary),
      (start) => {
        Assert.eq(
          'Should be initial start value',
          start,
          parseStartValue(start).map(parseDetail).getOrDie()
        );
      }
    ), { endOnFailure: true });
  });
});
