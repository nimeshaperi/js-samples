(function(exports) {
  "use strict";

  var commonjsGlobal =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
      ? global
      : typeof self !== "undefined"
      ? self
      : {};

  function createCommonjsModule(fn, module) {
    return (
      (module = { exports: {} }), fn(module, module.exports), module.exports
    );
  }

  var check = function(it) {
    return it && it.Math == Math && it;
  }; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028

  var global_1 = // eslint-disable-next-line no-undef
    check(typeof globalThis == "object" && globalThis) ||
    check(typeof window == "object" && window) ||
    check(typeof self == "object" && self) ||
    check(typeof commonjsGlobal == "object" && commonjsGlobal) || // eslint-disable-next-line no-new-func
    Function("return this")();

  var fails = function(exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty

  var descriptors = !fails(function() {
    return (
      Object.defineProperty({}, 1, {
        get: function() {
          return 7;
        }
      })[1] != 7
    );
  });

  var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

  var NASHORN_BUG =
    getOwnPropertyDescriptor &&
    !nativePropertyIsEnumerable.call(
      {
        1: 2
      },
      1
    ); // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

  var f = NASHORN_BUG
    ? function propertyIsEnumerable(V) {
        var descriptor = getOwnPropertyDescriptor(this, V);
        return !!descriptor && descriptor.enumerable;
      }
    : nativePropertyIsEnumerable;

  var objectPropertyIsEnumerable = {
    f: f
  };

  var createPropertyDescriptor = function(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var toString = {}.toString;

  var classofRaw = function(it) {
    return toString.call(it).slice(8, -1);
  };

  var split = "".split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

  var indexedObject = fails(function() {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object("z").propertyIsEnumerable(0);
  })
    ? function(it) {
        return classofRaw(it) == "String" ? split.call(it, "") : Object(it);
      }
    : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function(it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  // toObject with fallback for non-array-like ES3 strings

  var toIndexedObject = function(it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var isObject = function(it) {
    return typeof it === "object" ? it !== null : typeof it === "function";
  };

  // `ToPrimitive` abstract operation
  // https://tc39.github.io/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string

  var toPrimitive = function(input, PREFERRED_STRING) {
    if (!isObject(input)) return input;
    var fn, val;
    if (
      PREFERRED_STRING &&
      typeof (fn = input.toString) == "function" &&
      !isObject((val = fn.call(input)))
    )
      return val;
    if (
      typeof (fn = input.valueOf) == "function" &&
      !isObject((val = fn.call(input)))
    )
      return val;
    if (
      !PREFERRED_STRING &&
      typeof (fn = input.toString) == "function" &&
      !isObject((val = fn.call(input)))
    )
      return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function(it, key) {
    return hasOwnProperty.call(it, key);
  };

  var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

  var EXISTS = isObject(document$1) && isObject(document$1.createElement);

  var documentCreateElement = function(it) {
    return EXISTS ? document$1.createElement(it) : {};
  };

  // Thank's IE8 for his funny defineProperty

  var ie8DomDefine =
    !descriptors &&
    !fails(function() {
      return (
        Object.defineProperty(documentCreateElement("div"), "a", {
          get: function() {
            return 7;
          }
        }).a != 7
      );
    });

  var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

  var f$1 = descriptors
    ? nativeGetOwnPropertyDescriptor
    : function getOwnPropertyDescriptor(O, P) {
        O = toIndexedObject(O);
        P = toPrimitive(P, true);
        if (ie8DomDefine)
          try {
            return nativeGetOwnPropertyDescriptor(O, P);
          } catch (error) {
            /* empty */
          }
        if (has(O, P))
          return createPropertyDescriptor(
            !objectPropertyIsEnumerable.f.call(O, P),
            O[P]
          );
      };

  var objectGetOwnPropertyDescriptor = {
    f: f$1
  };

  var anObject = function(it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + " is not an object");
    }

    return it;
  };

  var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty

  var f$2 = descriptors
    ? nativeDefineProperty
    : function defineProperty(O, P, Attributes) {
        anObject(O);
        P = toPrimitive(P, true);
        anObject(Attributes);
        if (ie8DomDefine)
          try {
            return nativeDefineProperty(O, P, Attributes);
          } catch (error) {
            /* empty */
          }
        if ("get" in Attributes || "set" in Attributes)
          throw TypeError("Accessors not supported");
        if ("value" in Attributes) O[P] = Attributes.value;
        return O;
      };

  var objectDefineProperty = {
    f: f$2
  };

  var createNonEnumerableProperty = descriptors
    ? function(object, key, value) {
        return objectDefineProperty.f(
          object,
          key,
          createPropertyDescriptor(1, value)
        );
      }
    : function(object, key, value) {
        object[key] = value;
        return object;
      };

  var setGlobal = function(key, value) {
    try {
      createNonEnumerableProperty(global_1, key, value);
    } catch (error) {
      global_1[key] = value;
    }

    return value;
  };

  var SHARED = "__core-js_shared__";
  var store = global_1[SHARED] || setGlobal(SHARED, {});
  var sharedStore = store;

  var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

  if (typeof sharedStore.inspectSource != "function") {
    sharedStore.inspectSource = function(it) {
      return functionToString.call(it);
    };
  }

  var inspectSource = sharedStore.inspectSource;

  var WeakMap = global_1.WeakMap;
  var nativeWeakMap =
    typeof WeakMap === "function" && /native code/.test(inspectSource(WeakMap));

  var shared = createCommonjsModule(function(module) {
    (module.exports = function(key, value) {
      return (
        sharedStore[key] ||
        (sharedStore[key] = value !== undefined ? value : {})
      );
    })("versions", []).push({
      version: "3.6.5",
      mode: "global",
      copyright: "© 2020 Denis Pushkarev (zloirock.ru)"
    });
  });

  var id = 0;
  var postfix = Math.random();

  var uid = function(key) {
    return (
      "Symbol(" +
      String(key === undefined ? "" : key) +
      ")_" +
      (++id + postfix).toString(36)
    );
  };

  var keys = shared("keys");

  var sharedKey = function(key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var hiddenKeys = {};

  var WeakMap$1 = global_1.WeakMap;
  var set, get, has$1;

  var enforce = function(it) {
    return has$1(it) ? get(it) : set(it, {});
  };

  var getterFor = function(TYPE) {
    return function(it) {
      var state;

      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError("Incompatible receiver, " + TYPE + " required");
      }

      return state;
    };
  };

  if (nativeWeakMap) {
    var store$1 = new WeakMap$1();
    var wmget = store$1.get;
    var wmhas = store$1.has;
    var wmset = store$1.set;

    set = function(it, metadata) {
      wmset.call(store$1, it, metadata);
      return metadata;
    };

    get = function(it) {
      return wmget.call(store$1, it) || {};
    };

    has$1 = function(it) {
      return wmhas.call(store$1, it);
    };
  } else {
    var STATE = sharedKey("state");
    hiddenKeys[STATE] = true;

    set = function(it, metadata) {
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };

    get = function(it) {
      return has(it, STATE) ? it[STATE] : {};
    };

    has$1 = function(it) {
      return has(it, STATE);
    };
  }

  var internalState = {
    set: set,
    get: get,
    has: has$1,
    enforce: enforce,
    getterFor: getterFor
  };

  var redefine = createCommonjsModule(function(module) {
    var getInternalState = internalState.get;
    var enforceInternalState = internalState.enforce;
    var TEMPLATE = String(String).split("String");
    (module.exports = function(O, key, value, options) {
      var unsafe = options ? !!options.unsafe : false;
      var simple = options ? !!options.enumerable : false;
      var noTargetGet = options ? !!options.noTargetGet : false;

      if (typeof value == "function") {
        if (typeof key == "string" && !has(value, "name"))
          createNonEnumerableProperty(value, "name", key);
        enforceInternalState(value).source = TEMPLATE.join(
          typeof key == "string" ? key : ""
        );
      }

      if (O === global_1) {
        if (simple) O[key] = value;
        else setGlobal(key, value);
        return;
      } else if (!unsafe) {
        delete O[key];
      } else if (!noTargetGet && O[key]) {
        simple = true;
      }

      if (simple) O[key] = value;
      else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, "toString", function toString() {
      return (
        (typeof this == "function" && getInternalState(this).source) ||
        inspectSource(this)
      );
    });
  });

  var path = global_1;

  var aFunction = function(variable) {
    return typeof variable == "function" ? variable : undefined;
  };

  var getBuiltIn = function(namespace, method) {
    return arguments.length < 2
      ? aFunction(path[namespace]) || aFunction(global_1[namespace])
      : (path[namespace] && path[namespace][method]) ||
          (global_1[namespace] && global_1[namespace][method]);
  };

  var ceil = Math.ceil;
  var floor = Math.floor; // `ToInteger` abstract operation
  // https://tc39.github.io/ecma262/#sec-tointeger

  var toInteger = function(argument) {
    return isNaN((argument = +argument))
      ? 0
      : (argument > 0 ? floor : ceil)(argument);
  };

  var min = Math.min; // `ToLength` abstract operation
  // https://tc39.github.io/ecma262/#sec-tolength

  var toLength = function(argument) {
    return argument > 0 ? min(toInteger(argument), 0x1fffffffffffff) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min; // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

  var toAbsoluteIndex = function(index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
  };

  // `Array.prototype.{ indexOf, includes }` methods implementation

  var createMethod = function(IS_INCLUDES) {
    return function($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el)
        while (length > index) {
          value = O[index++]; // eslint-disable-next-line no-self-compare

          if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
        }
      else
        for (; length > index; index++) {
          if ((IS_INCLUDES || index in O) && O[index] === el)
            return IS_INCLUDES || index || 0;
        }
      return !IS_INCLUDES && -1;
    };
  };

  var arrayIncludes = {
    // `Array.prototype.includes` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    includes: createMethod(true),
    // `Array.prototype.indexOf` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod(false)
  };

  var indexOf = arrayIncludes.indexOf;

  var objectKeysInternal = function(object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;

    for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys

    while (names.length > i)
      if (has(O, (key = names[i++]))) {
        ~indexOf(result, key) || result.push(key);
      }

    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = [
    "constructor",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
    "toString",
    "valueOf"
  ];

  var hiddenKeys$1 = enumBugKeys.concat("length", "prototype"); // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames

  var f$3 =
    Object.getOwnPropertyNames ||
    function getOwnPropertyNames(O) {
      return objectKeysInternal(O, hiddenKeys$1);
    };

  var objectGetOwnPropertyNames = {
    f: f$3
  };

  var f$4 = Object.getOwnPropertySymbols;

  var objectGetOwnPropertySymbols = {
    f: f$4
  };

  // all object keys, includes non-enumerable and symbols

  var ownKeys =
    getBuiltIn("Reflect", "ownKeys") ||
    function ownKeys(it) {
      var keys = objectGetOwnPropertyNames.f(anObject(it));
      var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
      return getOwnPropertySymbols
        ? keys.concat(getOwnPropertySymbols(it))
        : keys;
    };

  var copyConstructorProperties = function(target, source) {
    var keys = ownKeys(source);
    var defineProperty = objectDefineProperty.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has(target, key))
        defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };

  var replacement = /#|\.prototype\./;

  var isForced = function(feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL
      ? true
      : value == NATIVE
      ? false
      : typeof detection == "function"
      ? fails(detection)
      : !!detection;
  };

  var normalize = (isForced.normalize = function(string) {
    return String(string)
      .replace(replacement, ".")
      .toLowerCase();
  });

  var data = (isForced.data = {});
  var NATIVE = (isForced.NATIVE = "N");
  var POLYFILL = (isForced.POLYFILL = "P");
  var isForced_1 = isForced;

  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;

  /*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/

  var _export = function(options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;

    if (GLOBAL) {
      target = global_1;
    } else if (STATIC) {
      target = global_1[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global_1[TARGET] || {}).prototype;
    }

    if (target)
      for (key in source) {
        sourceProperty = source[key];

        if (options.noTargetGet) {
          descriptor = getOwnPropertyDescriptor$1(target, key);
          targetProperty = descriptor && descriptor.value;
        } else targetProperty = target[key];

        FORCED = isForced_1(
          GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key,
          options.forced
        ); // contained in target

        if (!FORCED && targetProperty !== undefined) {
          if (typeof sourceProperty === typeof targetProperty) continue;
          copyConstructorProperties(sourceProperty, targetProperty);
        } // add a flag to not completely full polyfills

        if (options.sham || (targetProperty && targetProperty.sham)) {
          createNonEnumerableProperty(sourceProperty, "sham", true);
        } // extend global

        redefine(target, key, sourceProperty, options);
      }
  };

  var arrayMethodIsStrict = function(METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return (
      !!method &&
      fails(function() {
        // eslint-disable-next-line no-useless-call,no-throw-literal
        method.call(
          null,
          argument ||
            function() {
              throw 1;
            },
          1
        );
      })
    );
  };

  var nativeJoin = [].join;
  var ES3_STRINGS = indexedObject != Object;
  var STRICT_METHOD = arrayMethodIsStrict("join", ","); // `Array.prototype.join` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.join

  _export(
    {
      target: "Array",
      proto: true,
      forced: ES3_STRINGS || !STRICT_METHOD
    },
    {
      join: function join(separator) {
        return nativeJoin.call(
          toIndexedObject(this),
          separator === undefined ? "," : separator
        );
      }
    }
  );

  var defineProperty = objectDefineProperty.f;

  var FunctionPrototype = Function.prototype;
  var FunctionPrototypeToString = FunctionPrototype.toString;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = "name"; // Function instances `.name` property
  // https://tc39.github.io/ecma262/#sec-function-instances-name

  if (descriptors && !(NAME in FunctionPrototype)) {
    defineProperty(FunctionPrototype, NAME, {
      configurable: true,
      get: function() {
        try {
          return FunctionPrototypeToString.call(this).match(nameRE)[1];
        } catch (error) {
          return "";
        }
      }
    });
  }

  /*
   * Copyright 2019 Google LLC. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  // This example requires the Places library. Include the libraries=places
  // parameter when you first load the API. For example:
  // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">
  function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
      center: {
        lat: -33.8688,
        lng: 151.2195
      },
      zoom: 13
    });
    var card = document.getElementById("pac-card");
    var input = document.getElementById("pac-input");
    var types = document.getElementById("type-selector");
    var strictBounds = document.getElementById("strict-bounds-selector");
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);
    var autocomplete = new google.maps.places.Autocomplete(input); // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.

    autocomplete.bindTo("bounds", map); // Set the data fields to return when the user selects a place.

    autocomplete.setFields(["address_components", "geometry", "icon", "name"]);
    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById("infowindow-content");
    infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });
    autocomplete.addListener("place_changed", function() {
      infowindow.close();
      marker.setVisible(false);
      var place = autocomplete.getPlace();

      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      } // If the place has a geometry, then present it on a map.

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17); // Why 17? Because it looks good.
      }

      marker.setPosition(place.geometry.location);
      marker.setVisible(true);
      var address = "";

      if (place.address_components) {
        address = [
          (place.address_components[0] &&
            place.address_components[0].short_name) ||
            "",
          (place.address_components[1] &&
            place.address_components[1].short_name) ||
            "",
          (place.address_components[2] &&
            place.address_components[2].short_name) ||
            ""
        ].join(" ");
      }

      infowindowContent.children["place-icon"].src = place.icon;
      infowindowContent.children["place-name"].textContent = place.name;
      infowindowContent.children["place-address"].textContent = address;
      infowindow.open(map, marker);
    }); // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.

    function setupClickListener(id, types) {
      var radioButton = document.getElementById(id);
      radioButton.addEventListener("click", function() {
        autocomplete.setTypes(types);
      });
    }

    setupClickListener("changetype-all", []);
    setupClickListener("changetype-address", ["address"]);
    setupClickListener("changetype-establishment", ["establishment"]);
    setupClickListener("changetype-geocode", ["geocode"]);
    document
      .getElementById("use-strict-bounds")
      .addEventListener("click", function() {
        console.log("Checkbox clicked! New state=" + this.checked);
        autocomplete.setOptions({
          strictBounds: this.checked
        });
      });
  }

  exports.initMap = initMap;
})((this.window = this.window || {}));
