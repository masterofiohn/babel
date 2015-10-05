export default function () {
  var immutabilityVisitor = {
    enter(path, state) {
      var stop = () => {
        state.isImmutable = false;
        path.stop();
      };

      if (path.isJSXClosingElement()) {
        path.skip();
        return;
      }

      if (path.isJSXIdentifier({ name: "ref" }) && path.parentPath.isJSXAttribute({ name: path.node })) {
        return stop();
      }

      if (path.isJSXIdentifier() || path.isIdentifier() || path.isJSXMemberExpression()) {
        return;
      }

      if (!path.isImmutable()) stop();
    }
  };

  return {
    visitor: {
      JSXElement(path) {
        if (path.node._hoisted) return;

        var state = { isImmutable: true };
        path.traverse(immutabilityVisitor, state);

        if (state.isImmutable) {
          path.hoist();
        } else {
          path.node._hoisted = true;
        }
      }
    }
  };
}