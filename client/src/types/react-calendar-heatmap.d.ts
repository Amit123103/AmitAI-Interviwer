
declare module 'react-calendar-heatmap' {
    import * as React from 'react';

    export interface Props {
        values: { date: string | Date; count: number;[key: string]: any }[];
        startDate?: string | Date;
        endDate?: string | Date;
        gutterSize?: number;
        classForValue?: (value: any) => string;
        tooltipDataAttrs?: (value: any) => object;
        titleForValue?: (value: any) => string;
        showWeekdayLabels?: boolean;
        onClick?: (value: any) => void;
    }

    export default class CalendarHeatmap extends React.Component<Props> { }
}
