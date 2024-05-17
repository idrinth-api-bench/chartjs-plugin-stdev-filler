import {
    Chart,
} from 'chart.js';

interface Source {
    visible: boolean;
    index: number;
    below: number[];
    color: string;
    above: number[];
}

export default {
    id: 'stdev-filler',

    afterDatasetsUpdate(chart: Chart) {
        const count: number = (chart.data.datasets || []).length;

        for (let i = 0; i < count; i++) {
            const meta = chart.getDatasetMeta(i);
            const line = chart.data.datasets[i];

            if (line && typeof line['stdev'] === 'object' && (line.type === 'line' || typeof line.type === 'undefined')) {
                // @ts-ignore
                const stdev: number[] = line?.stdev ?? [];
                let color = 'rgba(0,0,0,0.1)';
                if (typeof line.borderColor === 'string') {
                    color = line.borderColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/u, 'rgba($1,$2,$3,0.1)');
                }
                meta["$stdevFiller"] = {
                    visible: chart.isDatasetVisible(i),
                    index: i,
                    color,
                    below: line.data.map((x: number, pos: number,) => x - stdev[pos]??0) as number[],
                    above: line.data.map((x: number, pos: number,) => x + stdev[pos]??0) as number[],
                };
            }
        }
    },

    beforeDatasetDraw(chart: Chart, args: { meta: { $stdevFiller?: Source; }; }) {
        const source = args?.meta?.$stdevFiller;

        if (! source || !source.visible) {
            return;
        }

        chart.ctx.fillStyle = source.color;
        let pos = 0;
        const height = chart.chartArea.height/chart.scales.y.max;
        const width = chart.chartArea.width/chart.scales.x.max
        const point = (x: number, y: number) => [
            x * width + chart.chartArea.left,
            (chart.scales.y.max - y) * height + chart.chartArea.top,
        ];

        // @ts-ignore
        chart.ctx.moveTo(...point(0, source.below[0]));
        for (const y of source.below) {
            // @ts-ignore
            chart.ctx.lineTo(...point(pos, y));
            pos ++;
        }
        pos --;
        for (const y of source.above.toReversed()) {
            // @ts-ignore
            chart.ctx.lineTo(...point(pos, y));
            pos --;
        }
        // @ts-ignore
        chart.ctx.lineTo(...point(0, source.below[0]));
        chart.ctx.fill();
        chart.ctx.fillStyle = 'transparent';
    },

    defaults: {
    }
};