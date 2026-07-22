import React from 'react';
import CreateForm from './Create';

export default function Edit(props) {
    return <CreateForm {...props} editMode={true} approvalData={props.approval} />;
}
