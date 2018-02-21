export default class CellContainer extends PureComponent {
  mapResult = (child: *) => child;

  renderContext = ([data, active]) => {
    const {
      row,
      column,
      onChange,
      DataEditor,
      DataViewer,
      getValue
    } = this.props;
    const isActive = active && active.row === row && active.column === column;
    return (
      <Cell
        {...{ row, column, onChange, DataEditor, DataViewer, getValue }}
        cell={data[row][column]}
        mode={active && isActive ? active.mode : "view"}
        isActive={Boolean(
          active && active.row === row && active.column === column
        )}
      />
    );
  };

  render() {
    return (
      <Composer
        components={[<Contexts.Data.Consumer />, <Contexts.Active.Consumer />]}
        mapResult={this.mapResult}
      >
        {this.renderContext}
      </Composer>
    );
  }
}
