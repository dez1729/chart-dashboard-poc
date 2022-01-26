import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import {
  KtdDragEnd,
  KtdDragStart,
  KtdGridComponent,
  KtdGridLayout,
  KtdGridLayoutItem,
  KtdResizeEnd,
  KtdResizeStart,
  ktdTrackById,
} from '@katoid/angular-grid-layout';
import { ktdArrayRemoveItem } from './utils';
import { DOCUMENT } from '@angular/common';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import _ from 'lodash';

import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import * as am5xy from "@amcharts/amcharts5/xy";
import { addDays } from 'date-fns';


@Component({
  selector: 'ktd-playground',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(KtdGridComponent, { static: true }) grid: KtdGridComponent;
  trackById = ktdTrackById;


  chartColors = [
    '#2eb3d2',
    '#c8d22e',
    '#da22c3',
  ];

  rootList = [];
  chartList = [];

  cols = 10;
  rowHeight = 50;
  compactType: 'vertical' | 'horizontal' | null = 'vertical';
  // idCount = 12;
  layout: KtdGridLayout = [
    { id: '0', x: 0, y: 0, w: 10, h: 9 },
    { id: '1', x: 0, y: 11, w: 4, h: 8 },
    { id: '2', x: 4, y: 11, w: 3, h: 4 },
    { id: '3', x: 4, y: 14, w: 3, h: 4 },
    { id: '4', x: 7, y: 11, w: 3, h: 8 },
    { id: '5', x: 0, y: 19, w: 5, h: 8 },
    { id: '6', x: 5, y: 19, w: 5, h: 8 },


    // { id: '0', x: 5, y: 0, w: 2, h: 3 },
    // { id: '1', x: 2, y: 2, w: 1, h: 2 },
    // { id: '2', x: 3, y: 7, w: 1, h: 2 },
    // { id: '3', x: 2, y: 0, w: 3, h: 2 },
    // { id: '4', x: 5, y: 3, w: 2, h: 3 },
    // { id: '5', x: 0, y: 4, w: 1, h: 3 },
    // // { id: '6', x: 9, y: 0, w: 2, h: 4 },
    // // { id: '7', x: 9, y: 4, w: 2, h: 2 },
    // { id: '6', x: 8, y: 0, w: 2, h: 4 },
    // { id: '7', x: 8, y: 4, w: 2, h: 2 },
    // { id: '8', x: 3, y: 2, w: 2, h: 5 },
    // { id: '9', x: 7, y: 0, w: 1, h: 3 },
    // { id: '10', x: 2, y: 4, w: 1, h: 4 },
    // { id: '11', x: 0, y: 0, w: 2, h: 4 },
  ];
  transitions: { name: string; value: string }[] = [
    {
      name: 'ease',
      value: 'transform 500ms ease, width 500ms ease, height 500ms ease',
    },
    {
      name: 'ease-out',
      value:
        'transform 500ms ease-out, width 500ms ease-out, height 500ms ease-out',
    },
    {
      name: 'linear',
      value: 'transform 500ms linear, width 500ms linear, height 500ms linear',
    },
    {
      name: 'overflowing',
      value:
        'transform 500ms cubic-bezier(.28,.49,.79,1.35), width 500ms cubic-bezier(.28,.49,.79,1.35), height 500ms cubic-bezier(.28,.49,.79,1.35)',
    },
    {
      name: 'fast',
      value: 'transform 200ms ease, width 200ms linear, height 200ms linear',
    },
    {
      name: 'slow-motion',
      value:
        'transform 1000ms linear, width 1000ms linear, height 1000ms linear',
    },
    { name: 'transform-only', value: 'transform 500ms ease' },
  ];
  currentTransition: string = this.transitions[0].value;

  dragStartThreshold = 0;
  autoScroll = true;
  disableDrag = false;
  disableResize = false;
  disableRemove = false;
  autoResize = true;
  preventCollision = false;
  isDragging = false;
  isResizing = false;
  resizeSubscription: Subscription;

  constructor(
    private ngZone: NgZone,
    public elementRef: ElementRef,
    @Inject(DOCUMENT) public document: Document
  ) {
    // this.ngZone.onUnstable.subscribe(() => console.log('UnStable'));
  }

  generateData() {
    let dataArray = [{ date: new Date('2020-Jan-01').getTime(), col1data: 100, col2data: 150, col3data: 200 }];

    for (let i = 1; i <= 365 * 2; i++) {
      const date = addDays(new Date('2020-Jan-01'), i).getTime();
      dataArray.push({
        date,
        col1data: Math.round(dataArray[i-1].col1data + (Math.random() - 0.5) * 20),
        col2data: Math.round(dataArray[i-1].col2data + (Math.random() - 0.5) * 30),
        col3data: Math.round(dataArray[i-1].col3data + (Math.random() - 0.5) * 40),
        // col2data: Math.round((Math.random() - 0.5) * 300),
        // col3data: Math.round(Math.random() * 400),
      });
    }

    return dataArray;
  }

  ngOnInit() {

    this.resizeSubscription = merge(
      fromEvent(window, 'resize'),
      fromEvent(window, 'orientationchange')
    )
    .pipe(
      debounceTime(50),
      filter(() => this.autoResize)
    )
    .subscribe(() => {
      this.grid.resize();
    });

    // this.setupCharts();
  }

  ngAfterViewInit(): void {
      this.setupCharts();
  }

  setupCharts() {
    // const i = parseInt(index);
    for (let i = 0; i < _.size(this.layout); i++) {
      this.rootList[i] = am5.Root.new('chartdiv-' + i);
      this.rootList[i].setThemes([
        am5themes_Animated.new(this.rootList[i]),
        am5themes_Dark.new(this.rootList[i]),
      ])

      this.chartList[i] = this.rootList[i].container.children.push(
        am5xy.XYChart.new(this.rootList[i], {
          panX: false,
          panY: false,
          wheelX: 'panX',
          wheelY: 'zoomX',
        })
      );

      const cursor = this.chartList[i].set('cursor', am5xy.XYCursor.new(this.rootList[i], {
        behavior: 'zoomX'
      }));
      cursor.lineY.set('visible', false);

      const data = this.generateData();
      console.log(`chart ${i}:`, data);

      const xAxis = this.chartList[i].xAxes.push(am5xy.DateAxis.new(this.rootList[i], {
        baseInterval: { timeUnit: 'day', count: 1 },
        renderer: am5xy.AxisRendererX.new(this.rootList[i], {}),
      }));

      xAxis.data.setAll(data);

      const yAxis = this.chartList[i].yAxes.push(am5xy.ValueAxis.new(this.rootList[i], {
        renderer: am5xy.AxisRendererY.new(this.rootList[i], {}),
      }))

      for (let j = 1; j <= 3; j++) {
        const series = this.chartList[i].series.push(am5xy.LineSeries.new(this.rootList[i], {
          name: `series ${j}`,
          xAxis,
          yAxis,
          valueYField: `col${j}data`,
          valueXField: 'date',
          fill: am5.color(this.chartColors[j - 1]),
          stroke: am5.color(this.chartColors[j - 1])
        }));

        series.data.setAll(data);
        series.appear(1000);
      }

      this.chartList[i].appear(1000, 100);
      console.log(`chart ${i} created`);
    }
  }


  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }

  onDragStarted(event: KtdDragStart) {
    this.isDragging = true;
  }

  onResizeStarted(event: KtdResizeStart) {
    this.isResizing = true;
  }

  onDragEnded(event: KtdDragEnd) {
    this.isDragging = false;
  }

  onResizeEnded(event: KtdResizeEnd) {
    this.isResizing = false;
  }

  // onClickAddNewItem() {


  //   this.layout = [
  //     ...this.layout,
  //     { id: `${this.idCount}`, x: 0, y: 0, w: 1, h: 1 }
  //   ]
  //   this.idCount++;
  // }

  onLayoutUpdated(layout: KtdGridLayout) {
    console.log('on layout updated', layout);
    this.layout = layout;
  }

  onCompactTypeChange(change: MatSelectChange) {
    console.log('onCompactTypeChange', change);
    this.compactType = change.value;
  }

  onTransitionChange(change: MatSelectChange) {
    console.log('onTransitionChange', change);
    this.currentTransition = change.value;
  }

  onAutoScrollChange(checked: boolean) {
    this.autoScroll = checked;
  }

  onDisableDragChange(checked: boolean) {
    this.disableDrag = checked;
  }

  onDisableResizeChange(checked: boolean) {
    this.disableResize = checked;
  }

  onDisableRemoveChange(checked: boolean) {
    this.disableRemove = checked;
  }

  onAutoResizeChange(checked: boolean) {
    this.autoResize = checked;
  }

  onPreventCollisionChange(checked: boolean) {
    this.preventCollision = checked;
  }

  onColsChange(event: Event) {
    this.cols = coerceNumberProperty((event.target as HTMLInputElement).value);
  }

  onRowHeightChange(event: Event) {
    this.rowHeight = coerceNumberProperty(
      (event.target as HTMLInputElement).value
    );
  }

  onDragStartThresholdChange(event: Event) {
    this.dragStartThreshold = coerceNumberProperty(
      (event.target as HTMLInputElement).value
    );
  }

  generateLayout() {
    const layout: KtdGridLayout = [];
    for (let i = 0; i < this.cols; i++) {
      const y = Math.ceil(Math.random() * 4) + 1;
      layout.push({
        x: Math.round(Math.random() * Math.floor(this.cols / 2 - 1)) * 2,
        y: Math.floor(i / 6) * y,
        w: 2,
        h: y,
        id: i.toString(),
        // static: Math.random() < 0.05
      });
    }
    console.log('layout', layout);
    this.layout = layout;
  }

  /** Adds a grid item to the layout */
  addItemToLayout() {
    const maxId = this.layout.reduce(
      (acc, cur) => Math.max(acc, parseInt(cur.id, 10)),
      -1
    );
    const nextId = maxId + 1;

    const newLayoutItem: KtdGridLayoutItem = {
      id: nextId.toString(),
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    };

    // Important: Don't mutate the array, create new instance. This way notifies the Grid component that the layout has changed.
    this.layout = [newLayoutItem, ...this.layout];
  }

  /**
   * Fired when a mousedown happens on the remove grid item button.
   * Stops the event from propagating an causing the drag to start.
   * We don't want to drag when mousedown is fired on remove icon button.
   */
  stopEventPropagation(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  /** Removes the item from the layout */
  removeItem(id: string) {
    // Important: Don't mutate the array. Let Angular know that the layout has changed creating a new reference.
    this.layout = ktdArrayRemoveItem(this.layout, (item) => item.id === id);
  }
}
