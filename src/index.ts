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
        // @ts-ignore
        const maxY = Math.max(...chart.data.datasets.map(set => Math.max(...set.data)));
        const height = chart.chartArea.height/maxY;
        const width = chart.width/(source.below.length + 1)
        chart.ctx.moveTo(chart.chartArea.left, source.below[0] * height + chart.chartArea.bottom);
        for (const y of source.below) {
            chart.ctx.lineTo(pos * width + chart.chartArea.left, y * height + chart.chartArea.bottom);
            pos ++;
        }
        pos --;
        for (const y of source.above.toReversed()) {
            chart.ctx.lineTo(pos * width + chart.chartArea.left, y * height + chart.chartArea.bottom);
            pos --;
        }
        chart.ctx.lineTo(chart.chartArea.left, source.below[0] * height + chart.chartArea.bottom);
        chart.ctx.fill();
    },

    defaults: {
    }
};