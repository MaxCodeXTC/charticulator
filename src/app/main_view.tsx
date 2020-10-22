// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
import * as React from "react";
import * as globals from "./globals";

import {
  ErrorBoundary,
  FloatingPanel,
  MinimizablePane,
  MinimizablePanelView,
  MessagePanel
} from "./components";
import { DragStateView, PopupContainer } from "./controllers";
import { AppStore } from "./stores";
import {
  AttributePanel,
  ChartEditorView,
  DatasetView,
  MarkEditorView
} from "./views";
import { MenuBar } from "./views/menubar";
import { ObjectListEditor } from "./views/panels/object_list_editor";
import { Toolbar } from "./views/tool_bar";
import { ScalesPanel } from "./views/panels/scales_panel";

export interface MainViewConfig {
  ColumnsPosition: "left" | "right";
  EditorPanelsPosition: "left" | "right";
  ToolbarPosition: "top" | "right" | "left";
  Name?: string;
}

export interface MainViewProps {
  store: AppStore;
  viewConfiguration: MainViewConfig;
}

export interface MainViewState {
  glyphViewMaximized: boolean;
  layersViewMaximized: boolean;
  attributeViewMaximized: boolean;
  scaleViewMaximized: boolean;
}

export class MainView extends React.Component<MainViewProps, MainViewState> {
  public refMenuBar: MenuBar;

  private viewConfiguration: MainViewConfig;

  constructor(props: MainViewProps) {
    super(props);

    if (!props.viewConfiguration) {
      this.viewConfiguration = {
        ColumnsPosition: "left",
        EditorPanelsPosition: "left",
        ToolbarPosition: "top"
      };
    } else {
      this.viewConfiguration = props.viewConfiguration;
    }

    this.state = {
      glyphViewMaximized: false,
      layersViewMaximized: false,
      attributeViewMaximized: false,
      scaleViewMaximized: false
    };

    props.store.addListener(AppStore.EVENT_GRAPHICS, () => this.forceUpdate());
  }

  public static childContextTypes = {
    store: (s: AppStore) => s instanceof AppStore
  };

  public getChildContext() {
    return {
      store: this.props.store
    };
  }

  public render() {
    const toolBarCreator = (layout: "vertical" | "horizontal") => {
      return (
        <div className={`charticulator__panel-editor-toolbar-${layout}`}>
          <Toolbar layout={layout} />
        </div>
      );
    };

    const datasetPanel = () => {
      return (
        <div className="charticulator__panel charticulator__panel-dataset">
          <MinimizablePanelView>
            <MinimizablePane title="Dataset" scroll={true} hideHeader={true}>
              <ErrorBoundary>
                <DatasetView store={this.props.store} />
              </ErrorBoundary>
            </MinimizablePane>
            {this.state.scaleViewMaximized ? null : (
              <MinimizablePane
                title="Scales"
                scroll={true}
                onMaximize={() => this.setState({ scaleViewMaximized: true })}
              >
                <ErrorBoundary>
                  <ScalesPanel store={this.props.store} />
                </ErrorBoundary>
              </MinimizablePane>
            )}
          </MinimizablePanelView>
        </div>
      );
    };

    const editorPanels = () => {
      return (
        <div
          className="charticulator__panel-editor-panel charticulator__panel-editor-panel-panes"
          style={{
            display:
              this.state.glyphViewMaximized &&
              this.state.attributeViewMaximized &&
              this.state.layersViewMaximized
                ? "none"
                : undefined
          }}
        >
          <MinimizablePanelView>
            {this.state.glyphViewMaximized ? null : (
              <MinimizablePane
                title="Glyph"
                scroll={false}
                onMaximize={() => this.setState({ glyphViewMaximized: true })}
              >
                <ErrorBoundary>
                  <MarkEditorView height={300} />
                </ErrorBoundary>
              </MinimizablePane>
            )}
            {this.state.layersViewMaximized ? null : (
              <MinimizablePane
                title="Layers"
                scroll={true}
                maxHeight={200}
                onMaximize={() => this.setState({ layersViewMaximized: true })}
              >
                <ErrorBoundary>
                  <ObjectListEditor />
                </ErrorBoundary>
              </MinimizablePane>
            )}
            {this.state.attributeViewMaximized ? null : (
              <MinimizablePane
                title="Attributes"
                scroll={true}
                onMaximize={() =>
                  this.setState({ attributeViewMaximized: true })
                }
              >
                <ErrorBoundary>
                  <AttributePanel store={this.props.store} />
                </ErrorBoundary>
              </MinimizablePane>
            )}
          </MinimizablePanelView>
        </div>
      );
    };

    const chartPanel = () => {
      return (
        <div className="charticulator__panel-editor-panel charticulator__panel-editor-panel-chart">
          <ErrorBoundary>
            <ChartEditorView store={this.props.store} />
          </ErrorBoundary>
        </div>
      );
    };

    return (
      <div
        className="charticulator__application"
        onDragOver={e => e.preventDefault()}
        onDrop={e => e.preventDefault()}
      >
        <MenuBar
          name={this.viewConfiguration.Name}
          ref={e => (this.refMenuBar = e)}
        />
        <section className="charticulator__panel-container">
          {[
            this.viewConfiguration.ColumnsPosition == "left" && datasetPanel(),
            <div className="charticulator__panel charticulator__panel-editor">
              {this.viewConfiguration.ToolbarPosition == "top" &&
                toolBarCreator("horizontal")}
              <div className="charticulator__panel-editor-panel-container">
                {[
                  this.viewConfiguration.EditorPanelsPosition == "left" &&
                    editorPanels(),
                  this.viewConfiguration.ToolbarPosition == "left" &&
                    toolBarCreator("vertical"),
                  chartPanel(),
                  this.viewConfiguration.ToolbarPosition == "right" &&
                    toolBarCreator("vertical"),
                  this.viewConfiguration.EditorPanelsPosition == "right" &&
                    editorPanels()
                ]}
              </div>
            </div>,
            this.viewConfiguration.ColumnsPosition == "right" && datasetPanel()
          ]}
        </section>
        <div className="charticulator__floating-panels">
          {this.state.glyphViewMaximized ? (
            <FloatingPanel
              peerGroup="panels"
              title="Glyph"
              onClose={() => this.setState({ glyphViewMaximized: false })}
            >
              <ErrorBoundary>
                <MarkEditorView />
              </ErrorBoundary>
            </FloatingPanel>
          ) : null}
          {this.state.layersViewMaximized ? (
            <FloatingPanel
              scroll={true}
              peerGroup="panels"
              title="Layers"
              onClose={() => this.setState({ layersViewMaximized: false })}
            >
              <ErrorBoundary>
                <ObjectListEditor />
              </ErrorBoundary>
            </FloatingPanel>
          ) : null}
          {this.state.attributeViewMaximized ? (
            <FloatingPanel
              scroll={true}
              peerGroup="panels"
              title="Attributes"
              onClose={() => this.setState({ attributeViewMaximized: false })}
            >
              <ErrorBoundary>
                <AttributePanel store={this.props.store} />
              </ErrorBoundary>
            </FloatingPanel>
          ) : null}
          {this.state.scaleViewMaximized ? (
            <FloatingPanel
              scroll={true}
              peerGroup="panels"
              title="Scales"
              onClose={() => this.setState({ scaleViewMaximized: false })}
            >
              <ErrorBoundary>
                <ScalesPanel store={this.props.store} />
              </ErrorBoundary>
            </FloatingPanel>
          ) : null}
        </div>
        <PopupContainer controller={globals.popupController} />
        {this.props.store.messageState.size ? (
          <div className="charticulator__floating-panels_errors">
            <FloatingPanel
              floatInCenter={true}
              scroll={true}
              peerGroup="messages"
              title="Errors"
              closeButtonIcon={"general/cross"}
              height={200}
              width={350}
            >
              <ErrorBoundary>
                <MessagePanel store={this.props.store} />
              </ErrorBoundary>
            </FloatingPanel>
          </div>
        ) : null}
        <DragStateView controller={globals.dragController} />
      </div>
    );
  }
}
