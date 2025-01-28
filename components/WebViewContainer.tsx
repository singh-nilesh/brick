import React, { forwardRef } from "react";
import { View } from "react-native";
import WebView, { WebViewProps } from "react-native-webview";

// Extend WebViewProps to include the props passed to WebViewContainer
interface WebViewContainerProps extends WebViewProps {}

// Use forwardRef to allow parent components to control the WebView instance
const WebViewContainer = forwardRef<WebView, WebViewContainerProps>(
  ({ source, onNavigationStateChange, startInLoadingState, renderLoading}, ref) => {
    return (
      <View style={{flex:1}}>
        <WebView
          ref={ref}
          source={source}
          cacheEnabled={true}
          onNavigationStateChange={onNavigationStateChange} 
          startInLoadingState={startInLoadingState} // Show loading state during navigation
          renderLoading={renderLoading} // Custom loading component
        />
      </View>
    );
  }
);

export default WebViewContainer;
