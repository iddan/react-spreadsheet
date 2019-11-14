import * as React from "react"
import classnames from "classnames"
import { connect } from "unistore/react"

import * as PointSet from "./point-set"
import FloatingRect, { mapStateToProps } from "./FloatingRect"
import { IStoreState } from "./types"

const Selected = ({ dragging, ...rest }: { dragging: any }) => (
  <FloatingRect {...rest} className={classnames("selected", { dragging })} />
)

export default connect((state: IStoreState<any>) => {
  const cells = state.selected
  const nextState = mapStateToProps(cells)(state)
  return {
    ...nextState,
    hidden: nextState.hidden || PointSet.size(cells) === 1,
    dragging: state.dragging
  }
})(Selected)
