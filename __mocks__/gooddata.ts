import { ISimpleExecutorResult } from '../src/Interfaces';
import { charts } from './fixtures';

const execution = {
    getData(projectId, columns): Promise<ISimpleExecutorResult> {
        if (columns.indexOf('too-large-measure') >= 0) {
            return Promise.reject({
                response: {
                    status: 413
                }
            });
        }

        if (columns.indexOf('bad-request') >= 0) {
            return Promise.reject({
                response: {
                    status: 400
                }
            });
        }

        if (columns.indexOf('empty-result') >= 0) {
            return Promise.resolve({
                rawData: [[]],
                isEmpty: true,
                headers: [{
                    id: 'abcd',
                    title: 'Attribute',
                    type: 'attrLabel',
                    uri: '/gdc/md/project/obj/1'
                }]
            });
        }

        return Promise.resolve({
            isLoaded: true,
            headers: [
                {
                    type: 'attrLabel',
                    id: 'date.aci81lMifn6q',
                    uri: '/gdc/md/budtwmhq7k94ve7rqj49j3620rzsm3u1/obj/851',
                    title: 'Quarter/Year (Date)'
                },
                {
                    type: 'metric',
                    id: '70026c20a1747d3e8215dbcc8a734888',
                    title: '# Logged-in Users',
                    format: '#,##0.00'
                },
                {
                    type: 'metric',
                    id: 'b1296cf75d1c2202667485a44013183e',
                    title: '# Users Opened AD',
                    format: '#,##0'
                }
            ],
            rawData: [
                [
                    'Q3/2016',
                    '56366',
                    '2610'
                ],
                [
                    'Q4/2016',
                    '57952',
                    '2779'
                ],
                [
                    'Q1/2017',
                    '60712',
                    '3013'
                ],
                [
                    'Q2/2017',
                    '53183',
                    '2072'
                ]
            ],
            warnings: [

            ],
            isEmpty: false
        });
    },

    getDataForVis(): Promise<ISimpleExecutorResult>  {
        return Promise.resolve({
            rawData: [['10000']],
            headers: [{
                id: 'abcd',
                title: 'Attribute',
                type: 'attrLabel',
                uri: '/gdc/md/project/obj/1'
            }]
        });
    }
};

const xhr = {
    get(uri) {
        const chart = charts.find((viz) => viz.visualization.meta.uri === uri);

        if (chart) {
            return Promise.resolve(chart);
        }

        return Promise.reject('Chart not found');
    }
};

const md = {
    getObjects(objects) {
        return Promise.resolve([]);
    }
};

export {
    execution,
    xhr,
    md,
};
