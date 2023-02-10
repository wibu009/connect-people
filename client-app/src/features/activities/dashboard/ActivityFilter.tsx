import { observer } from "mobx-react-lite";
import React from "react";
import { Calendar } from "react-calendar";
import { Header, Menu } from "semantic-ui-react";
import { useStore } from "../../../app/stores/store";

export default observer(function ActivityFilter() {
    const { predicate, setPredicate } = useStore().activityStore;

    return (
        <>
            <Menu vertical size='large' style={{ width: '100%', marginTop: 25, position: 'fixed', right: 0, top: 100, maxWidth: '25%', marginRight: 100 }}>
                <Header icon='filter' attached color='teal' content='Filters' />
                <Menu.Item content='All Activities' active={predicate.has('all')} onClick={() => setPredicate('all', 'true')} />
                <Menu.Item content="I'm going" active={predicate.has('isGoing')} onClick={() => setPredicate('isGoing', 'true')} />
                <Menu.Item content="I'm hosting" active={predicate.has('isHost')} onClick={() => setPredicate('isHost', 'true')} />
            </Menu>
            <Header />
            <Menu style={{ width: '100%', marginTop: 150, position: 'fixed', right: 0, top: 175, maxWidth: '25%', marginRight: 100 }}  >
                <Calendar onChange={(date: any) => setPredicate('startDate', date)} value={predicate.get('startDate') || new Date()} />
            </Menu>
        </>
    );
});