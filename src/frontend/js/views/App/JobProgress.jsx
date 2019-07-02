import React from 'react';
import {ProgressBar, OverlayTrigger, Popover} from 'react-bootstrap';

import ResizableDivider from 'components/ResizableDivider.jsx'

class JobProgress extends React.Component {
    constructor(props) {
        super(props);
        this.container = React.createRef();
        this.timeout = null;
    }

    render() {
        const headers = [
            'id',
            'description',
            'src_cloud',
            'src_resource',
            'dst_cloud',
            'dst_path',
            'state',
            'progress',
        ]

        const tableHeaders = headers.map((header, j) => {
            return (
                <th key={j}>
                    {header}
                </th>
            );
        })

        // TODO: Optimize
        const jobs = this.props.jobs.map(job => {
            const src_cloud_id = job['src_cloud_id']
            if (!src_cloud_id) {
                job['src_cloud'] = 'localhost'
            } else {
                const src_cloud = this.props.connections.find(d => d.id === src_cloud_id)
                if (src_cloud) {
                    job['src_cloud'] = src_cloud.name
                }
            }

            const dst_cloud_id = job['dst_cloud_id']
            if (!dst_cloud_id) {
                job['dst_cloud'] = 'localhost'
            } else {
                const dst_cloud = this.props.connections.find(d => d.id === dst_cloud_id)
                if (dst_cloud) {
                    job['dst_cloud'] = dst_cloud.name
                }
            }

            return job
        })

        const tableRows = jobs.map((job, i) => {
            const progress = Math.round(job.progress_current / job.progress_total * 100);

            job = {
                ...job,
                'state': job.progress_state,
                'progress': progress,
            }
            return (
                <tr
                    onClick={event => this._onSelectJob(job)}
                    key={job.id}
                >
                    {headers.map((header, j) => {
                        if (header === 'progress') {
                            return (
                                <td key={j}>
                                    <ProgressBar
                                        now={job[header]}
                                        label={`${job[header]}%`}
                                        variant='success'
                                    />
                                </td>
                            )
                        } else {
                            return (
                                <td key={j}>
                                    {job[header]}
                                </td>
                            );
                        }
                    })}
                </tr>
            );
        })

        const shouldRefresh = jobs.some(d => d.progress_state === 'PROGRESS');
        if (shouldRefresh) {
            this.scheduleRefresh();
        }

        return (
            <div
                id={this.props.id}
                ref={this.container}
                style={{position: 'relative'}}
            >
                <ResizableDivider
                    onResize={event => this.onResize(event)}
                />
                <table className='table table-sm table-striped table-hover text-center'>
                    <thead>
                        <tr>{tableHeaders}</tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>
        );
    }

    componentDidMount() {
        this.props.fetchData();
    }

    componentWillUnmount() {
        this._clearTimeout();
    }

    scheduleRefresh() {
        const refreshDelay = 1000; // 1s
        this._clearTimeout();
        this.timeout = setTimeout(() => {
            this.props.fetchData();
        }, refreshDelay)
    }

    onResize(event) {
        const container = this.container.current

        const newTop = event.pageY;
        const oldTop = container.offsetTop;

        const oldHeight = container.offsetHeight;
        const newHeight = oldHeight + oldTop - newTop;

        container.style.height = `${newHeight}px`
    }

    _onSelectJob(selectedJob) {
        this.props.onShowDetails(selectedJob.id);
    }

    _clearTimeout() {
        if (this.timeout) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
}

JobProgress.defaultProps = {
    id: '',
    jobs: [],
    fetchData: () => {},
    onStopJob: id => {},
    onShowDetails: (jobId) => {},
}

import {connect} from 'react-redux';
import { listCopyJobs, stopCopyJob } from 'actions/apiActions.jsx'
import { showCopyJobEditDialog } from 'actions/dialogActions.jsx';

const mapStateToProps = state => ({
    jobs: state.api.jobs,
    connections: state.api.clouds,
});

const mapDispatchToProps = dispatch => ({
    fetchData: () => dispatch(listCopyJobs()),
    onStopJob: id => dispatch(stopCopyJob(id)),
    onShowDetails: (jobId) => dispatch(showCopyJobEditDialog(jobId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(JobProgress);