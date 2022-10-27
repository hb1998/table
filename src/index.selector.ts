import Table from '.';
import { borderWidth } from './config';
import { expr2xy, Rect, Range, Area } from 'table-renderer';

function setCellValue(t: Table, value: string) {
  const { _selector } = t;
  if (_selector) {
    const { _ranges } = _selector;
    _ranges.forEach((it) => {
      if (it) {
        it.each((r, c) => {
          t.cell(r, c, { value });
        });
      }
    });
    t.render();
  }
}

function reset(t: Table) {
  const { _selector, _overlayer, _container } = t;
  const { _rowHeader, _colHeader, viewport } = t._renderer;
  if (_selector && viewport) {
    const { _placement } = _selector;
    _selector.clear();

    const x = _rowHeader.width;
    const y = _colHeader.height;
    const width = t._width() - x;
    const height = t._height() - y;

    const addAreas = (
      intersectsFunc: (r: Range, r1: Range) => boolean,
      rectFunc: (area: Area, r: Range, areaIndex: number) => Rect
    ) => {
      viewport.areas.forEach((area, index) => {
        const target = _overlayer.areas[index];
        _selector._ranges.forEach((it, i) => {
          if (intersectsFunc(area.range, it)) {
            _selector.addArea(i, rectFunc(area, it, index), target);
          }
        });
        const { _focusAreas, _focusRange } = _selector;
        if (_focusRange) {
          if (intersectsFunc(area.range, _focusRange)) {
            _selector.addFocusArea(rectFunc(area, _focusRange, index), target);
          }
        }
      });
    };

    const addHeaderAreas = (type: 'row' | 'col', areaIndexes: number[]) => {
      areaIndexes.forEach((index) => {
        const area = viewport.headerAreas[index];
        const target = _overlayer.headerAreas[index];
        if (type === 'row') {
          _selector._rowHeaderRanges.forEach((it) => {
            if (area.range.intersectsRow(it.startRow, it.endRow)) {
              _selector.addRowHeaderArea(area.rectRow(it.startRow, it.endRow), target);
            }
          });
        } else {
          _selector._colHeaderRanges.forEach((it) => {
            if (area.range.intersectsCol(it.startCol, it.endCol)) {
              _selector.addColHeaderArea(area.rectCol(it.startCol, it.endCol), target);
            }
          });
        }
      });
    };

    if (_placement === 'all') {
      _selector
        .addArea(0, { x, y, width, height }, _container)
        .addRowHeaderArea({ x: 0, y, width: x, height }, _container)
        .addColHeaderArea({ x, y: 0, width, height: y }, _container);
    } else if (_placement === 'row-header') {
      addAreas(
        (r, r1) => r.intersectsRow(r1.startRow, r1.endRow),
        (area, r1, areaIndex) => {
          const rectr = area.rectRow(r1.startRow, r1.endRow);
          // hide overlap border
          rectr.width += borderWidth;
          if (areaIndex === 0 || areaIndex === 3) rectr.x -= borderWidth;
          return rectr;
        }
      );
      addHeaderAreas('row', [2, 3]);
      [0, 1].forEach((index) => {
        _selector.addColHeaderArea({ x: 0, y: 0, width, height: y }, _overlayer.headerAreas[index]);
      });
    } else if (_placement === 'col-header') {
      addAreas(
        (r, r1) => r.intersectsCol(r1.startCol, r1.endCol),
        (area, r1, areaIndex) => {
          const rect = area.rectCol(r1.startCol, r1.endCol);
          // hide overlap border
          rect.height += borderWidth;
          if (areaIndex === 2 || areaIndex === 3) rect.y -= borderWidth;
          return rect;
        }
      );
      addHeaderAreas('col', [0, 1]);
      [2, 3].forEach((index) => {
        _selector.addRowHeaderArea({ x: 0, y: 0, height, width: x }, _overlayer.headerAreas[index]);
      });
    } else {
      addAreas(
        (r, r1) => r.intersects(r1),
        (area, r1) => area.rect(r1)
      );
      addHeaderAreas('row', [2, 3]);
      addHeaderAreas('col', [0, 1]);
    }
  }
}

function move(t: Table, direction: 'up' | 'down' | 'left' | 'right') {
  const { _selector, _data } = t;
  const { viewport } = t._renderer;
  if (_selector && viewport) {
    let [fr, fc] = _selector._focus;
    _selector.move(direction, 1);
    if (_data.freeze && (direction === 'down' || direction === 'right')) {
      const [fc1, fr1] = expr2xy(_data.freeze);
      const [srows, scols] = _data.scroll;
      if (fr + 1 === fr1 && srows > 0) {
        t._vScrollbar?.scroll(0);
        return;
      }
      if (fc + 1 === fc1 && scols > 0) {
        t._hScrollbar?.scroll(0);
        return;
      }
    }

    const [, , , area4] = viewport.areas;
    [fr, fc] = _selector._focus;
    const { _focusRange } = _selector;
    let [rows, cols] = [1, 1];
    if (_focusRange) {
      rows += _focusRange.rows;
      cols += _focusRange.cols;
    }
    const { startRow, startCol, endRow, endCol } = area4.range;
    if (viewport.inAreas(fr, fc) && endRow !== fr && endCol !== fc) {
      reset(t);
    } else {
      if (direction === 'up') {
        t._vScrollbar?.scrollBy(-t.rowsHeight(fr, fr + rows), true);
      } else if (direction === 'down') {
        t._vScrollbar?.scrollBy(t.rowsHeight(startRow, startRow + rows), true);
      } else if (direction === 'left') {
        t._hScrollbar?.scrollBy(-t.colsWidth(fc, fc + cols), true);
      } else if (direction === 'right') {
        t._hScrollbar?.scrollBy(t.colsWidth(startCol, startCol + cols), true);
      }
    }
  }
}

export default {
  setCellValue,
  reset,
  move,
};
