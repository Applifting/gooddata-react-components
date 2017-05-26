import * as React from 'react';
import noop = require('lodash/noop');
import TableTransformation from '@gooddata/indigo-visualizations/lib/Table/TableTransformation';
import { Execute } from '../execution/Execute';
import { IAfm } from '../../interfaces/Afm';
import { ITransformation, ISort } from '../../interfaces/Transformation';
import { IntlWrapper } from './IntlWrapper';
import { IEvents } from './events';
import { getSorting, ISortingChange } from '../../helpers/sorting';
import { generateConfig } from '../../helpers/config';

export interface ITableProps extends IEvents {
    afm: IAfm;
    projectId: string;
    transformation?: ITransformation;
}

export interface ITableState {
    error: boolean;
    result: any;
    isLoading: boolean;
    sorting: ISort;
}

const defaultErrorHandler = (error) => {
    console.error(error);
};

export class Table extends React.Component<ITableProps, ITableState> {
    public static defaultProps: Partial<ITableProps> = {
        transformation: {},
        onError: defaultErrorHandler,
        onLoadingChanged: noop
    };

    constructor(props) {
        super(props);

        this.state = {
            error: false,
            result: null,
            isLoading: true,
            sorting: null
        };

        this.onError = this.onError.bind(this);
        this.onExecute = this.onExecute.bind(this);
        this.onLoading = this.onLoading.bind(this);
        this.onSortChange = this.onSortChange.bind(this);
    }

    public onExecute(data) {
        this.setState({ result: data, error: false });
    }

    public onError(error) {
        this.setState({ error: true });
        this.props.onError(error);
    }

    public onLoading(isLoading: boolean) {
        this.setState({ isLoading });
        this.props.onLoadingChanged({ isLoading });
    }

    public onSortChange(change: ISortingChange) {
        this.setState({ sorting: getSorting(change, this.state.sorting) });
    }

    public getComponent() {
        if (this.state.isLoading) {
            return null;
        }

        return (
            <IntlWrapper>
                <TableTransformation
                    data={this.state.result}
                    config={generateConfig('table', this.props.afm, this.getTransformation())}
                    onSortChange={this.onSortChange}
                />
            </IntlWrapper>
        );
    }

    public getTransformation(): ITransformation {
        const { sorting } = this.state;
        const { transformation } = this.props;

        if (sorting) {
            return { ...transformation, sorting: [sorting] };
        }

        return transformation;
    }

    public render() {
        const {
            afm,
            projectId
        } = this.props;

        if (this.state.error) {
            return null;
        }

        return (
            <Execute
                className={`gdc-table-chart`}
                afm={afm}
                transformation={this.getTransformation()}
                onError={this.onError}
                onExecute={this.onExecute}
                onLoading={this.onLoading}
                projectId={projectId}
            >
                {this.getComponent()}
            </Execute>
        );
    }
}
