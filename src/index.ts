import {Chart, LineElement} from "chart.js";
import _default from "chart.js/dist/core/core.interaction";
import x = _default.modes.x;

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
        const count = (chart.data.datasets || []).length;

        for (let i = 0; i < count; ++i) {
            const meta = chart.getDatasetMeta(i);
            const line = meta.dataset;

            if (line && line.options && typeof line.options.borderColor === 'string' && typeof line.options.stdev === 'object' && line instanceof LineElement) {
                // @ts-ignore
                const stdev: number[] = line.options?.stdev ?? [];
                meta["$stdevFiller"] = {
                    visible: chart.isDatasetVisible(i),
                    index: i,
                    color: line.options.borderColor.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, 'rgba($1,$2,$3,0.1)'),
                    below: chart.data.datasets[i].data.map((x: number, pos,) => x - stdev[pos]),
                    above: chart.data.datasets[i].data.map((x: number, pos,) => x + stdev[pos]),
                };
            }
        }
    },

    beforeDatasetDraw(chart: Chart, args: { meta: { $stdevFiller?: Source; }; }) {
        const source = args.meta.$stdevFiller;

        if (! source || !source.visible) {
            return;
        }

        chart.ctx.fillStyle = source.color;
        let pos = 0;
        for (const y of source.below) {
            chart.ctx.moveTo(pos, y);
            pos ++;
        }
        pos = 0;
        for (const y of source.above) {
            chart.ctx.moveTo(pos, y);
            pos ++;
        }
        chart.ctx.moveTo(0, source.below[0]);
        chart.ctx.fill();
    },

    defaults: {
    }
};