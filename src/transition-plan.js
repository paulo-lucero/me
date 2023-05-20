import BezierEasing from 'bezier-easing';

/**
 *
 * @param {*} obj
 * @return {boolean}
 */
function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 *
 * @param {number} value
 * @return {string}
 */
function cssPx(value) {
  return `${value}px`;
}

/**
 *
 * @param {number} value
 * @return {string}
 */
function topPx(value) {
  return `top: ${cssPx(value)};\n`;
}

/**
 *
 * @param {number} value
 * @return {string}
 */
function heightPx(value) {
  return `height: ${cssPx(value)};\n`;
}

/**
 *
 * @param {number} value
 * @return {string}
 */
function transformRotateDeg(value) {
  return `transform: rotate(${value}deg);\n`;
}

/**
 *
 * @param {number} value
 * @return {string}
 */
function borderRadiusPx(value) {
  return `border-radius: ${cssPx(value)};\n`;
}

/**
 *
 * @param {number} value
 * @return {string}
 */
function opacity(value) {
  return `opacity: ${value};\n`;
}

/**
 *
 * @param {String} tr
 * @return {Number}
 */
function getTransformRotate(tr) {
  if (tr === 'none') return 0;
  const values = tr.split('(')[1].split(')')[0].split(',');
  const a = values[0];
  const b = values[1];

  // next line works for 30deg but not 130deg (returns 50);
  // var angle = Math.round(Math.asin(sin) * (180/Math.PI));
  return Math.atan2(b, a) * (180/Math.PI);
}

/**
 *
 * @param {function} callbn
 * @return {{ height:function }}
 */
function heightObject(callbn) {
  return {
    height: callbn
  };
}

/**
 * Parsing css style value
 */
class CssStyleValueParsers {
  static defaultParser = parseFloat;
  static 'rotate(?deg)' = getTransformRotate;
}

/**
 * @typedef {'linear'|'instant'|'easeOut'|[number, number, number, number]|TimingFunc} AnimationType
 */

/**
 * Generate Css Style infos, use long-hand properties or single valued properties
 */
class PropertyState {
  #property = null;
  #initialValue = null;
  #diffvalue = null;
  #valueFormat = null;
  #valuePoints = null;
  #finalValue = null;
  /** @type {Function} */
  static #numberRegExs = [
    /-\d+\.\d+/,
    /-\d+/,
    /\d+\.\d+/,
    /\d+/
  ];

  /**
   *
   * @param {string} cssStyle
   * @return {string}
   */
  static getProperty(cssStyle) {
    return cssStyle.match(/.*(?=\s*:)/)[0]
        .trim().toLowerCase();
  }

  /**
   *
   * @param {string} cssStyle
   * @return {string}
   */
  static getValue(cssStyle) {
    return cssStyle.match(/(?<=:\s*).*/)[0]
        .replace(';', '').trim().toLowerCase();
  }

  /**
   *
   * @param {string} finalStyle
   * @return {RegExp}
   */
  static findNumRegEx(finalStyle) {
    let matchNumRegEx;
    for (const numberRegEx of PropertyState.#numberRegExs) {
      const isNumRegEx = finalStyle.match(numberRegEx);
      if (!isNumRegEx) continue;
      matchNumRegEx = numberRegEx;
      break;
    }

    return matchNumRegEx;
  }

  /**
   *
   * @param {string} finalStyle
   * @param {string} format
   * @param {RegExp} regExp
   * @return {number}
   */
  static parseStyleValue(finalStyle, format, regExp) {
    const numParser = format && CssStyleValueParsers?.[format] ?
      CssStyleValueParsers[format] :
      CssStyleValueParsers.defaultParser;
    return numParser(format ? finalStyle : finalStyle.match(regExp)[0]);
  }

  /**
   *
   * @param {string} styleValue
   * @return {number}
   */
  static parseValueOnly(styleValue) {
    const numRegEx = PropertyState.findNumRegEx(styleValue);

    return PropertyState.parseStyleValue(styleValue, null, numRegEx);
  }

  /**
   *
   * @param {string} finalStyle
   * @param {string} msg
   */
  static ifValidFinalStyle(finalStyle, msg) {
    if (
      typeof finalStyle === 'string' ||
      typeof finalStyle === 'function'
    ) return;
    new Error(`${finalStyle} is not a valid ${msg}`);
  }

  /**
   * @typedef {string|function(): string} CssValuePoint
   */

  /**
   *
   * @param {string|function(): string} valuePoint
   * @return {string}
   */
  static #getValueString(valuePoint) {
    return typeof valuePoint === 'function' ?
      valuePoint() :
      valuePoint;
  }

  /**
   *
   * @param {string|function(): string} valuePoint
   * @return {string}
   */
  static #getValueFormat(valuePoint) {
    const styleValue = PropertyState.#getValueString(valuePoint);
    const numberRegExp = PropertyState.findNumRegEx(styleValue);
    return styleValue.replace(numberRegExp, '?');
  }

  /**
   *
   * @param {string|function(): string} valuePoint
   * @return {number}
   */
  static #parseValuePoint(valuePoint) {
    const styleValue = PropertyState.#getValueString(valuePoint);
    const numberRegExp = PropertyState.findNumRegEx(styleValue);
    return PropertyState.parseStyleValue(styleValue, null, numberRegExp);
  }

  /**
   * @param {string} property
   * @param {[CssValuePoint, CssValuePoint]} valuePoints e.g. ['rotate(45deg)', 'rotate(-45deg)'], ['1px', '8px'], [callback, callback]
   */
  constructor(property, valuePoints) {
    valuePoints.forEach((valuePoint, i) => {
      PropertyState.ifValidFinalStyle(valuePoint, `finalStyle${i +1}`);
    });

    this.#property = property;

    this.#valuePoints = valuePoints;
    this.#parsedValuePoints();

    this.#valueFormat = PropertyState.#getValueFormat(valuePoints[0]);
  }

  /** */
  #parsedValuePoints() {
    const valuePoints = this.#valuePoints;
    this.#initialValue = PropertyState.#parseValuePoint(valuePoints[0]);
    this.#finalValue = PropertyState.#parseValuePoint(valuePoints[1]);
    this.#diffvalue = this.finalValue - this.initialValue;
  }

  /**
   *
   * @param {Element|HTMLElement|Node} element
   * @return {number}
   */
  fetchCurrent(element) {
    const currentStyle = getComputedStyle(element)
        .getPropertyValue(this.property);
    const numberRegExp = PropertyState.findNumRegEx(currentStyle);
    return PropertyState.parseStyleValue(
        currentStyle,
        this.valueFormat,
        numberRegExp
    );
  }

  /**
   * @return {string}
   */
  get property() {
    return this.#property;
  }

  /**
   * @return {number}
   */
  get initialValue() {
    return this.#initialValue;
  }

  /**
   * @param {number} val
   */
  set initialValue(val) {
    this.#valuePoints[0] = typeof val === 'number' ?
      val :
      this.#valuePoints[0];
    this.#parsedValuePoints();
  }

  /**
   * difference between initial value and final value
   * @return {number}
   */
  get diffValue() {
    return this.#diffvalue;
  }

  /**
   * @return {string}
   */
  get valueFormat() {
    return this.#valueFormat;
  }

  /**
   * get the finalValue
   */
  get finalValue() {
    return this.#finalValue;
  }

  /**
   *
   * @param {Element|HTMLElement|Node} element
   * @param {number} value
   */
  setStyle(element, value) {
    element.style.setProperty(
        this.property,
        this.valueFormat.replace('?', value.toString())
    );
  }

  /**
   *
   */
  updatePoints() {
    this.#parsedValuePoints();
  }
}

/**
 * Represent the current state of the elements and property in Transition
 */
class StyleState {
  /**
   * @type {Map<string, Map<string, TransitionState>>}
   */
  #stylesMap = new Map();
  /** @type {TransitionProgressPlan} */
  #progressPlan = null;

  /**
   *
   * @param {TransitionProgressPlan} progressPlan
   */
  constructor(progressPlan) {
    this.#progressPlan = progressPlan;
  }

  /**
   *
   * @param {TransitionState} transitionStateArg
   * @param {string} propertyName
   */
  register(transitionStateArg, propertyName) {
    const element = transitionStateArg.element;
    const elementID = transitionStateArg.elementID;
    if (
      this.#stylesMap.has(elementID) &&
      this.#stylesMap.get(elementID).has(propertyName)
    ) return;

    const propertyState = transitionStateArg.propertyState(propertyName);

    const currentValue = propertyState.fetchCurrent(element).toFixed(4);

    const initialValue = propertyState.initialValue.toFixed(4);

    if (currentValue !== initialValue) return;

    this.update(transitionStateArg, propertyName);
  }

  /**
   *
   * @param {TransitionState} transitionStateArg
   * @param {string} propertyName
   */
  update(transitionStateArg, propertyName) {
    const elementID = transitionStateArg.elementID;
    const hasElementID = this.#stylesMap.has(elementID);
    if (!hasElementID) this.#stylesMap.set(elementID, new Map());

    const elementStyleMap = this.#stylesMap.get(elementID);
    elementStyleMap.set(propertyName, transitionStateArg);
  }

  /**
   *
   * @param {Map<string, TransitionState>} transitionStateMap
   */
  #refreshPropertyState(transitionStateMap) {
    for (
      const [propertyName, transitionState] of transitionStateMap.entries()
    ) {
      const propertyState = transitionState.propertyState(propertyName);
      propertyState.updatePoints();
      this.#progressPlan.animate(transitionState, propertyState);
    }
  }

  /**
   *
   */
  refresh() {
    for (const transitionStateMap of this.#stylesMap.values()) {
      this.#refreshPropertyState(transitionStateMap);
    }
  }
}

/**
 * @typedef {'toStart'|'inProgress'|'finished'} ActionStatuses
 */

/**
 * @typedef {string|function(): string} StringOrFunction
 */

/**
 * @typedef {[StringOrFunction, StringOrFunction]} StylePointsSetArg
 */

/**
 * @typedef {Object<string, Set<string>>} PropertiesMap
 */

/**
 * @typedef {string|Object<string, StringOrFunction>} ValuePoint
 */

/**
 * @callback TimingFunc
 * @param {number} timeProgress between 0 and 1
 * @param {boolean} isForward progressing or reversing
 * @return {number} Animation progress
 */

/**
 * @param {number} progress
 * @return {number}
 */
function linearProgression(progress) {
  return progress;
}

/**
 *
 * @param {number} progress
 * @param {boolean} isForward
 * @return {number}
 */
function instantProgression(progress, isForward) {
  return isForward ? 1 : 0;
}

/**
 * Contains data for animation like duration, animationType
 */
class TransitionProgress {
  /** @type {number} */
  #duration = null;
  /** @type {AnimationType} */
  #animationType = '';
  /**
   * Represent current time elapsed
   * @type {number}
   */
  #transitionElapsed = null;
  /**
   * Represent the current animation progress
   * @type {number}
   */
  #currentProgress = 0;
  /**
   * @type {TimingFunc}
   */
  #timingFunc;

  /**
   *
   * @param {number} currentProgress
   * @param {number} startProgress
   * @param {number} diffProgress
   * @return {number}
   */
  static calculateProgressFromDiff(
      currentProgress,
      startProgress,
      diffProgress
  ) {
    return (currentProgress - startProgress) / diffProgress;
  }

  /**
   *
   * @param {number} current
   * @param {number} start
   * @param {number} diff
   * @param {number} duration
   * @return {number}
   */
  static calculateTimeElapsedFromProgress(
      current,
      start,
      diff,
      duration
  ) {
    return TransitionProgress.calculateProgressFromDiff(
        current,
        start,
        diff
    ) * duration;
  }

  /**
   * @type {Map<string, TimingFunc>}
   */
  static #timingFuncs = new Map()
      .set('linear', linearProgression)
      .set('instant', instantProgression)
      // eslint-disable-next-line new-cap
      .set('easeOut', BezierEasing(0.61, 1, 0.88, 1));

  /**
   *
   * @param {string} timingType
   * @return {string}
   */
  static #validTiming(timingType) {
    const validTimingNames = Array.from(
        TransitionProgress.#timingFuncs.keys()
    );
    const defaultTiming = validTimingNames[0];
    if (typeof timingType !== 'string') return defaultTiming;

    timingType = timingType.trim();
    const isValid = validTimingNames
        .some((timingName) => timingType === timingName);
    return isValid ? timingType : defaultTiming;
  }

  /**
   *
   * @param {number} val
   * @return {boolean}
   */
  static #isOperable(val) {
    return !isNaN(val) &&
      val !== Infinity &&
      val !== -Infinity;
  }

  /**
   *
   * @param {number} val
   * @return {number}
   */
  static #leastValue(val) {
    val = (
      !TransitionProgress.#isOperable(val) ||
      val < 0
    ) ? 0 : val;
    return val;
  }

  /**
   *
   * @param {*} val
   * @param {string} msg
   */
  static #isNumber(val, msg) {
    if (typeof val === 'number') return;
    throw new Error(`This ${val} isn\'t a valid value for ${msg}`);
  }

  /**
   *
   * @param {number} duration
   * @param {AnimationType} animationType
   */
  constructor(duration, animationType) {
    this.#duration = duration;
    this.animationType = animationType;
  }

  /**
   * @param {AnimationType} timingName
   */
  set animationType(timingName) {
    if (Array.isArray(timingName) && timingName.length === 4) {
      // eslint-disable-next-line new-cap
      this.#timingFunc = BezierEasing(...timingName);
    } else if (typeof timingName === 'function') {
      this.#timingFunc = timingName;
    } else {
      timingName = TransitionProgress.#validTiming(timingName);
      this.#timingFunc = TransitionProgress.#timingFuncs
          .get(timingName);
      this.#animationType = timingName;
    }
  }

  /** */
  get isNotInstant() {
    return this.#animationType !== 'instant';
  }

  /**
   * @param {number} val
   */
  set duration(val) {
    TransitionProgress.#isNumber(val, 'duration');

    this.#duration = TransitionProgress.#leastValue(val);
  }

  /** @return {number} */
  get duration() {
    return this.isNotInstant ? this.#duration : 0;
  }

  /**
   * @param {number} val
   */
  set transitionElapsed(val) {
    TransitionProgress.#isNumber(val, 'time progress');

    if (this.isNotInstant) {
      val = TransitionProgress.#leastValue(val);
      val = Math.min(val, this.duration);
    } else {
      val = 0;
    }

    this.#transitionElapsed = val;
  }

  /**
   * @return {number}
   */
  get transitionElapsed() {
    return this.#transitionElapsed;
  }

  /**
   * @param {number} val
   */
  set currentProgress(val) {
    TransitionProgress.#isNumber(val, 'animation progress');

    this.#currentProgress = val;
  }

  /**
   * @return {number} Animation progress
   */
  get currentProgress() {
    return this.#currentProgress;
  }

  /**
   * @return {TimingFunc}
   */
  get timingFunc() {
    return this.#timingFunc;
  }
}

/**
 * @typedef {{start: number, end: number, largestEnd: number, total: number, timingFunc: TimingFunc}} ProgressObj
 */

/**
 * TransitionProgress for TransitionState
 */
class TransitionProgressState extends TransitionProgress {
  /** @type {number} */
  #startTimeProgress = null;
  /** @type {number} */
  #endTimeProgress = null;
  /** @type {number} */
  #diffTimeProgress = null;

  /**
   *
   * @param {ProgressObj} progressObj
   * @return {number}
   */
  calculateProgressPoints(progressObj) {
    const start = progressObj.start;
    const end = start + super.duration;
    const total = progressObj.total;
    this.#startTimeProgress = start / total;
    this.#endTimeProgress = end / total;
    this.#diffTimeProgress = this.endTimeProgress - this.startTimeProgress;
    return end;
  }

  /**
   * @return {number}
   */
  get startTimeProgress() {
    return this.#startTimeProgress;
  }

  /**
   * @return {number}
   */
  get endTimeProgress() {
    return this.#endTimeProgress;
  }

  /**
   * @return {number}
   */
  get diffTimeProgress() {
    return this.#diffTimeProgress;
  }
}

/**
 * TransitionProgress for TransitionPlan
 */
class TransitionProgressPlan extends TransitionProgress {
  #isForward = true;
  /** @type {number} */
  #prevTimeStamp = null;
  /**
   * @type {number} elapsed time between previous and current timeStamp
   *
   */
  #stampElapsed = null;
  /**
   * Refers which duration and animationType should be use
   * If true, then TransitionProgressPlan should be use otherwise use TransitionProgressState
   * @type {boolean}
   */
  #inPlanTimings = false;

  // i = -1
  // f = -5
  // d = -4
  //
  // progressing (p++):
  //   d1 = -5 - -1 = -4
  //   d1 < 0: decreasing effect : current > final
  //   p = 0.5
  //   c = -4 * 0.5 = -2
  //   -1 + -2 = -3 > -5: true : unfinished
  //   p = 1.1
  //   c = -4 * (1.1) = -4.4
  //   -1 + -4.4 = -5.4 > -5 : false : finished
  //
  // reversing (p--):
  //   d1 = -1 - -5 = 4
  //   d1 > 0: increasing effect : current < final
  //   p = 0.5
  //   c = -4 * 0.5 = -2
  //   -1 + -2 = -3 < -1: true : unfinished
  //   p = -0.1
  //   c = -4 * -0.1 = 0.4
  //   -1 + 0.4 = -0.6 < -1 : false : finsihed

  /**
   *
   * @param {number} current
   * @param {number} start
   * @param {number} end
   * @return {boolean}
   */
  static #isInBetween(
      current,
      start,
      end
  ) {
    return current >= start && current <= end;
  }

  /**
   *
   * @param {number} current
   * @return {boolean}
   */
  static #isInStart(current) {
    return current <= 0;
  }

  /**
   *
   * @param {number} current
   * @return {boolean}
   */
  static #isInEnd(current) {
    return current >= 1;
  }

  /**
   *
   * @param {number} duration
   * @param {AnimationType} animationType
   */
  constructor(duration, animationType) {
    super(duration, animationType);
    if (typeof duration === 'number') this.timings(duration, animationType);
  }

  /**
   * TranstionPlan duration and animationType is used instead the one found in TransitionState, resulting the animationType are "spread" throughout of duration
   *
   * @param {number} duration
   * @param {AnimationType} animationType
   */
  timings(duration, animationType) {
    super.duration = duration;
    super.animationType = animationType;
    this.#inPlanTimings = true;
    super.transitionElapsed = 0; // can be further improve by implementing elapsed duration
  }

  /**
   *
   * @param {number} timeStamp
   * @return {TransitionProgressPlan}
   */
  calculateStampElapsed(timeStamp) {
    if (this.#prevTimeStamp === null) {
      this.#prevTimeStamp = timeStamp;
    }
    this.#stampElapsed = timeStamp - this.#prevTimeStamp;
    this.#prevTimeStamp = timeStamp;

    if (this.inPlanTimings) {
      this.currentProgress = this.#calculateProgress(this);
    }
    return this;
  }

  /**
   *
   * @param {TransitionProgress} progressObj
   * @param {number} stampElapsed
   * @return {number}
   */
  #calculateTransitionElapsed(progressObj, stampElapsed) {
    stampElapsed = typeof stampElapsed === 'number' ?
      stampElapsed :
      this.#stampElapsed;
    const isForward = this.#isForward;
    const timesBy = isForward ? 1 : -1;
    progressObj.transitionElapsed = progressObj.transitionElapsed +
      (stampElapsed * timesBy);
    return progressObj.transitionElapsed;
  }

  /**
   *
   * @param {TransitionState} transitionStateArg
   * @return {boolean}
   */
  #isForTransitionInPlanTiming(transitionStateArg) {
    const stateStartProgress = transitionStateArg.startTimeProgress;
    const stateEndProgress = transitionStateArg.endTimeProgress;
    const planCurrentProgress = this.currentProgress;

    const isInBetween = TransitionProgressPlan.#isInBetween(
        planCurrentProgress,
        stateStartProgress,
        stateEndProgress
    );
    return isInBetween ||
      (
        TransitionProgressPlan.#isInStart(stateStartProgress) &&
        TransitionProgressPlan.#isInStart(planCurrentProgress)
      ) ||
      (
        TransitionProgressPlan.#isInEnd(stateEndProgress) &&
        TransitionProgressPlan.#isInEnd(planCurrentProgress)
      );
  }

  /**
   *
   * @param {TransitionState} progressStateArg
   * @return {number}
   */
  #calculateProgressFromPlanTiming(progressStateArg) {
    const stateStartProgress = progressStateArg.startTimeProgress;
    const stateEndProgress = progressStateArg.endTimeProgress;
    const planCurrentProgress = this.currentProgress;

    const isForTransition = this.#isForTransitionInPlanTiming(progressStateArg);

    const stateCurrentProgress = isForTransition ?
      planCurrentProgress :
      (
        planCurrentProgress < stateStartProgress ?
          stateStartProgress :
          stateEndProgress
      );

    return progressStateArg.isNotInstant ?
    (
      TransitionProgress.calculateProgressFromDiff(
          stateCurrentProgress,
          stateStartProgress,
          progressStateArg.diffTimeProgress
      )
    ) : (
      planCurrentProgress < stateStartProgress ? 0 : 1
    );
  }

  /**
   *
   * @param {TransitionProgress} progressObj
   * @return {number}
   */
  #calculateProgress(progressObj) {
    const timeElapsed = this.#calculateTransitionElapsed(progressObj);
    return progressObj.timingFunc(
        timeElapsed / progressObj.duration,
        this.#isForward
    );
  }

  /**
   * Calulate TransitionState animation progress
   * @param {TransitionState} transitionStateArg
   */
  calculateProgress(transitionStateArg) {
    const inStatesTimings = this.inStatesTimings;

    let progress;
    if (inStatesTimings) {
      progress = this.#calculateProgress(transitionStateArg);
    } else {
      progress = this.isNotInstant ?
        this.#calculateProgressFromPlanTiming(transitionStateArg) :
        this.timingFunc(null, this.#isForward);
    }

    transitionStateArg.currentProgress = progress;
  }

  /**
   *
   * @param {TransitionState} transitionStateArg
   * @param {PropertyState} propertyStateArg
   * @return {boolean}
   */
  animate(
      transitionStateArg,
      propertyStateArg
  ) {
    const element = transitionStateArg.element;

    const isComplete = this.inStatesTimings &&
      this.isComplete(transitionStateArg);

    const nextValue = this.#calculateNextValue(
        transitionStateArg,
        propertyStateArg,
        isComplete
    );

    propertyStateArg.setStyle(element, nextValue);

    return isComplete;
  }

  /**
   *
   * @param {TransitionProgress} progressObj
   * @return {boolean}
   */
  isComplete(progressObj) {
    const isForward = this.#isForward;
    const endTime = isForward ? progressObj.duration : 0;
    const transitionElapsed = progressObj.transitionElapsed;
    return isForward ?
      transitionElapsed >= endTime :
      transitionElapsed <= endTime;
  }

  /**
   *
   * @param {TransitionProgress} progressObj
   * @param {PropertyState} propertyState
   * @param {boolean} isComplete
   * @return {number}
   */
  #calculateNextValue(progressObj, propertyState, isComplete) {
    const isForward = this.#isForward;
    const animationProgress = progressObj.currentProgress;
    const initialValue = propertyState.initialValue;
    const finalValue = propertyState.finalValue;
    const diffValue = propertyState.diffValue;
    return isComplete ?
      (isForward ? finalValue : initialValue) :
      (initialValue + (diffValue * animationProgress));
  }

  /**
   * if true then should use TransitionProgressPlan duration and animationType, otherwise use TransitionProgressState
   * @return {boolean}
   */
  get inPlanTimings() {
    return this.#inPlanTimings;
  }

  /**
   * if true then should use TransitionProgressState duration and animationType, otherwise use TransitionProgressPlan
   * @return {boolean}
   */
  get inStatesTimings() {
    return !this.#inPlanTimings;
  }

  /**
   * @return {number}
   */
  get prevTimeStamp() {
    return this.#prevTimeStamp;
  }

  /**
   * switch from forward progression to reverse or vice versa
   */
  switchProgression() {
    this.#isForward = !this.#isForward;
  }

  /** */
  reset() {
    this.#prevTimeStamp = null;
  }
}

/**
 * One transitional phase of property of group of properties, sharing only two possible final values
 * All properties will be animated at same time
 * if a property/properties has more than 2 final values, need to construct additional TransitionState
 */
class TransitionState extends TransitionProgressState {
  /**
   * @typedef {Map<string, PropertyState>} PropertiesStateMap
   */
  /**
   * @type {PropertiesStateMap}
   */
  #properties = new Map();
  #elementID;
  /** @type {StyleState} */
  #styleState = null;

  /**
   *
   * @param {string} property
   * @param {StringOrFunction} value
   * @param {Object.<string, [string]>} properties
   */
  static #storeValue(property, value, properties) {
    if (Object.hasOwn(properties, property)) {
      properties[property].push(value);
    } else {
      properties[property] = [value];
    }
  }

  /**
   *
   * @param {ValuePoint} valuePoint
   * @param {Object.<string, [string]>} properties
   */
  static #parseValuePointFromString(valuePoint, properties) {
    for (const stylePoint of valuePoint.split(';')) {
      if (!stylePoint.trim()) continue;

      const property = PropertyState.getProperty(stylePoint);
      const value = PropertyState.getValue(stylePoint);

      TransitionState.#storeValue(property, value, properties);
    }
  }

  /**
   *
   * @param {ValuePoint} valuePoint
   * @param {Object.<string, [string]>} properties
   */
  static #parseValuePointFromObject(valuePoint, properties) {
    for (const [property, value] of Object.entries(valuePoint)) {
      TransitionState.#storeValue(
          property.trim().toLowerCase(),
          value,
          properties
      );
    }
  }

  /**
   *
   * @param {[ValuePoint, ValuePoint]} valuePoints
   * @return {[[string, [StringOrFunction, StringOrFunction]]]}
   */
  #parseStyles(valuePoints) {
    /** @type {Object.<string, [StringOrFunction]>} */
    const properties = {};

    for (const valuePoint of valuePoints) {
      if (typeof valuePoint === 'string') {
        TransitionState.#parseValuePointFromString(
            valuePoint,
            properties
        );
      } else if (isObject(valuePoint)) {
        TransitionState.#parseValuePointFromObject(
            valuePoint,
            properties
        );
      } else {
        new Error(`This ${valuePoint} isn\'t a Number or Object`);
      }
    }

    const allFinalPoints = Object.values(properties);

    for (const finalPoints of allFinalPoints) {
      if (finalPoints.length === 2) continue;
      finalPoints.push(finalPoints[0]);
    }

    if (allFinalPoints.length === 0) {
      new Error('No properties found');
    }

    return Object.entries(properties);
  }

  /**
   *
   * @param {string} elementID
   * @param {string|[string, string]|[ValuePoint, ValuePoint]} finalStyles e.g. 'height: 1px;' | ['height: 1px;', 'height: 50px;'] | [{top: '1px', height: function }, {top: '5px', height: function }], when using function, it needs to return a style value like '5px'
   * @param {number} duration
   * @param {AnimationType} animationType
   */
  constructor(elementID, finalStyles, duration, animationType) {
    super(duration, animationType);
    this.duration = duration;

    this.#elementID = elementID;

    const points = !Array.isArray(finalStyles) ?
      [finalStyles, finalStyles] :
      finalStyles;

    const parsedStyles = this.#parseStyles(points);

    for (const [property, points] of parsedStyles) {
      this.#properties.set(
          property,
          new PropertyState(
              property,
              points
          )
      );
    }

    this.propertiesForEach((propertyState) => {
      this.readyTransition(propertyState);
    }, this);
  }

  /**
   *
   * @param {PropertyState} propertyStateArg
   */
  readyTransition(propertyStateArg) {
    const noDiffValue = propertyStateArg.diffValue === 0 ||
      typeof propertyStateArg.diffValue !== 'number';
    const noElapsed = this.transitionElapsed === null;

    const currentValue = noDiffValue || noElapsed ?
      propertyStateArg.fetchCurrent(this.element) :
      null;

    if (noDiffValue) {
      propertyStateArg.initialValue = currentValue;
    }

    if (noElapsed) {
      this.transitionElapsed = Math.abs(TransitionProgress
          .calculateTimeElapsedFromProgress(
              currentValue,
              propertyStateArg.initialValue,
              propertyStateArg.diffValue,
              this.duration
          ));
    }
  }

  /**
   * @callback PropertiesForEach
   * @param {PropertyState} propertyState
   * @param {string} propertyName
   * @param {Array} propertiesMap
   */

  /**
   *
   * @param {PropertiesForEach} func
   * @param {*} thisArg
   */
  propertiesForEach(func, thisArg = undefined) {
    this.#properties.forEach(func, thisArg);
  }

  /**
   *
   * @param {string} propertyName
   * @return {PropertyState}
   */
  propertyState(propertyName) {
    if (!this.#properties.has(propertyName)) {
      // eslint-disable-next-line max-len
      throw new Error(`Something went wrong, this property name doesn\'t exist ${propertyName} in this element with ID name ${this.#elementID}`);
    }

    return this.#properties.get(propertyName);
  }

  /**
   *
   * @param {StyleState} styleState
   */
  registerStyleState(styleState) {
    this.propertiesForEach((propertyState, propertyName) => {
      styleState.register(this, propertyName);
    }, this);
    this.#styleState = styleState;
  }

  // /**
  //  *
  //  * @param {ProgressObj} progressObj
  //  * @return {number}
  //  */
  // calculateProgressPoints(progressObj) {
  //   const end = super.calculateProgressPoints(progressObj);
  //   console.log(`ID: ${this.elementID}\nStart: ${this.startTimeProgress}\nEnd: ${this.endTimeProgress}`);
  //   return end;
  // }

  /**
   *
   * @param {TransitionProgressPlan} progressPlan
   * @return {Boolean} returns true if all transition is completed
   */
  update(progressPlan) {
    const hasStyleState = this.#styleState !== null;

    const results = [];

    progressPlan.calculateProgress(this);

    this.propertiesForEach((state, propertyName) => {
      results.push(progressPlan.animate(
          this,
          state
      ));

      if (hasStyleState) this.#styleState.update(this, propertyName);
    }, this);

    return results.length === 0 || results.every((result) => result);
  }

  /**
   * @return {string}
   */
  get elementID() {
    return this.#elementID;
  }

  /**
   * @return {Element|HTMLElement|Node}
   */
  get element() {
    const element = document.getElementById(this.#elementID);
    if (!element) {
      // eslint-disable-next-line max-len
      throw new Error(`Something went wrong, element with ID name ${this.#elementID} doesn\'t exist`);
    }

    return element;
  }
}

/**
 * @typedef {'along'|'later'} TransitionType
 */

/**
 * Link different TransitionStates
 */
class TransitionLink {
  /** @type {TransitionState|TransitionPlan} */
  #action;
  /** @type {TransitionType} */
  #transitionType; // along or later
  /** @type {ActionStatuses} */
  #actionStatus = 'toStart';
  /** @type {TransitionLink} */
  #nextLink = null;
  /** @type {TransitionLink} */
  #latestLink = null;

  /**
   *
   * @param {TransitionState|any} action
   * @param {TransitionType} transitionType
   */
  constructor(action, transitionType) {
    this.#action = action;
    this.#transitionType = transitionType;
  }

  // Sample: https://jsfiddle.net/8qc4nhky/2/

  /**
   *
   * @param {TransitionLink} transitionLink
   * @return {TransitionLink}
   */
  link(transitionLink) {
    if (this.#nextLink === null) {
      this.#nextLink = transitionLink;
    } else {
      this.#latestLink.link(transitionLink);
    }
    this.#latestLink = transitionLink;

    return this;
  }

  /**
   * Reverse TransitionLink
   * @param {TransitionLink} nextLink
   * @param {TransitionLink} latestLink
   * @return {TransitionLink}
   */
  switch(nextLink = null, latestLink = null) {
    const currentNextLink = this.#nextLink;
    const nextLatestLink = latestLink || this;
    const hasCurrentNextLink = currentNextLink !== null;
    this.#nextLink = nextLink;
    this.#latestLink = hasCurrentNextLink ? nextLink : latestLink;

    this.#action?.switch?.();
    this.#actionStatus = 'toStart';

    return hasCurrentNextLink ?
      currentNextLink.switch(this, nextLatestLink) :
      this;
  }

  /**
   *
   * @param {StyleState} styleStateArg
   */
  registerStyleState(styleStateArg) {
    this.#action.registerStyleState(styleStateArg);

    if (this.#nextLink === null) return;
    this.#nextLink.registerStyleState(styleStateArg);
  }

  /**
   *
   * @param {TransitionType} prevType
   * @return {boolean}
   */
  #isNextInTransition(prevType) {
    return (
      prevType === 'later' ||
      this.#transitionType === 'later'
    );
  }

  /**
   *
   * @param {TransitionType} prevType
   * @param {number} prevDuration
   * @return {number}
   */
  calculateDuration(prevType, prevDuration = 0) {
    let duration = this.#action.duration;
    const curType = this.#transitionType;
    const isNext = this.#isNextInTransition(prevType);
    if (!isNext) {
      duration = duration > prevDuration ? duration : prevDuration;
    } else {
      duration = prevDuration + duration;
    }
    const nextLink = this.#nextLink;
    return nextLink ?
      nextLink.calculateDuration(curType, duration) :
      duration;
  }

  /**
   *
   * @param {TransitionType} prevType
   * @param {ProgressObj} progressObj
   * @return {number}
   */
  calculateProgressPoints(prevType, progressObj) {
    const start = !this.#isNextInTransition(prevType) ?
      progressObj.start :
      progressObj.end;
    const end = this.#action.calculateProgressPoints(
        Object.assign({}, progressObj, {start})
    );
    const largestEnd = end > progressObj.largestEnd ?
      end :
      progressObj.largestEnd;
    const nextLink = this.#nextLink;
    return nextLink ?
      nextLink.calculateProgressPoints(
          this.#transitionType,
          Object.assign({}, progressObj, {start, end, largestEnd})
      ) :
      largestEnd;
  }

  /**
   *
   * @param {TransitionProgressPlan} progressPlan
   * @param {boolean} prevResult
   * @return {boolean}
   */
  update(progressPlan, prevResult = true) {
    const isInStateTimings = progressPlan.inStatesTimings;
    if (
      this.#transitionType === 'later' &&
      !prevResult &&
      isInStateTimings
    ) return prevResult;

    const transitionLink = this;

    const performNextLink = (nextResut) => {
      return transitionLink.#nextLink !== null ?
        transitionLink.#nextLink.update(progressPlan, nextResut) :
        nextResut;
    };

    const isFinished = this.#actionStatus === 'finished';
    if (isFinished) return performNextLink(prevResult && isFinished);

    const actionStatus = this.#actionStatus;
    const isToStart = actionStatus === 'toStart';
    this.#actionStatus = isToStart ? 'inProgress' : this.#actionStatus;
    const result = this.#action.update(progressPlan) &&
      prevResult; // In plan timings, TransitionProgressPlan.animate() will always return false,

    this.#actionStatus = result ? 'finished' : this.#actionStatus;
    return performNextLink(result);
  }

  // along/later: non-TransitionLink should have a update method and return a TransitionLink or object that has update method
}

/**
 * Animate using TransitionState data, this object is reusable and can be use to stop the current transition thus no need for constructing new TransitionPlan
 */
class TransitionPlan extends TransitionProgressPlan {
  #inProgress = false;
  #isFirstTime = true;
  #isAlternate = false;
  /**
   * @type {TransitionLink}
   */
  #transition = null;
  /** @type {StyleState} */
  #styleState = null;

  #isLog = false;
  #transitionName = '';
  /** @type {Number|null} */
  #startTimeStamp = null;

  /**
   * @param {string|TransitionState|TransitionPlan|undefined} elementID element id attribute
   * @param {string|[string, string]|[ValuePoint, ValuePoint]} finalStyles e.g. 'height: 1px;' | ['height: 1px;', 'height: 50px;'] | [{top: '1px', height: function }, {top: '5px', height: function }], when using function, it needs to return a style value like '5px'
   * @param {number|undefined} duration
   * @param {AnimationType} animationType
   */
  constructor(elementID, finalStyles, duration, animationType) {
    super(duration, animationType);
    this.#readyTransition(
        elementID,
        finalStyles,
        duration,
        animationType,
        'along'
    );
  }

  /**
   */
  #animate() {
    window.requestAnimationFrame(
        this.#performTransition.bind(this)
    );
  }

  /**
   * Reset Data
   */
  #reset() {
    this.#inProgress = false;
    this.#startTimeStamp = null;
    super.reset();
  }

  /**
   *
   * @param {Number} timeStamp
   */
  #performTransition(timeStamp) {
    if (super.prevTimeStamp === timeStamp || !this.#inProgress) return;

    if (this.#startTimeStamp === null) {
      this.#startTimeStamp = timeStamp;
    }

    const transitionComplete = this.#transition.update(
        super.calculateStampElapsed(timeStamp)
    );

    if (
      transitionComplete ||
      (this.inPlanTimings && this.isComplete(this))
    ) {
      if (this.#isLog) {
        const duration = timeStamp - this.#startTimeStamp;
        const formattedDuration = (duration / 1000).toFixed(4);
        // eslint-disable-next-line max-len
        console.log(`Transition Name: ${this.#transitionName}\nDuration: ${formattedDuration} sec`);
      }
      this.#reset();
      if (this.#isAlternate) {
        this.activate({
          autoReverse: true,
          alternate: true
        });
      }
    } else {
      this.#animate();
    }
  }

  /**
   * @param {string|TransitionState|TransitionPlan|undefined} elementID element id attribute
   * @param {string|[string, string]|[ValuePoint, ValuePoint]} finalStyles e.g. 'height: 1px;' | ['height: 1px;', 'height: 50px;'] | [{top: '1px', height: function }, {top: '5px', height: function }], when using function, it needs to return a style value like '5px'
   * @param {number|undefined} duration
   * @param {AnimationType} animationType
   * @param {TransitionType} transitionType
   */
  #readyTransition(
      elementID,
      finalStyles,
      duration,
      animationType,
      transitionType
  ) {
    const transitionState = typeof elementID === 'string' ?
      new TransitionState(elementID, finalStyles, duration, animationType) :
      elementID;

    if (!transitionState) return;

    const transitionLink = new TransitionLink(transitionState, transitionType);

    this.#transition = this.#transition !== null ?
      this.#transition.link(transitionLink) :
      transitionLink;
  }

  /**
   * if previous transition is "along", even it's not finish then this transition will perform
   * @param {string|TransitionState|TransitionPlan|undefined} elementID element id attribute
   * @param {string|[string, string]|[ValuePoint, ValuePoint]} finalStyles e.g. 'height: 1px;' | ['height: 1px;', 'height: 50px;'] | [{top: '1px', height: function }, {top: '5px', height: function }], when using function, it needs to return a style value like '5px'
   * @param {number|undefined} duration
   * @param {AnimationType} animationType
   * @return {TransitionPlan}
   */
  along(elementID, finalStyles, duration, animationType) {
    if (!this.#inProgress) {
      this.#readyTransition(
          elementID,
          finalStyles,
          duration,
          animationType,
          'along'
      );
    }

    return this;
  }

  /**
   * this transition will perform only, if previous is finished
   * @param {string|TransitionState|TransitionPlan|undefined} elementID element id attribute
   * @param {string|[string, string]|[ValuePoint, ValuePoint]} finalStyles e.g. 'height: 1px;' | ['height: 1px;', 'height: 50px;'] | [{top: '1px', height: function }, {top: '5px', height: function }], when using function, it needs to return a style value like '5px'
   * @param {number|undefined} duration
   * @param {AnimationType} animationType
   * @return {TransitionPlan}
   */
  later(elementID, finalStyles, duration, animationType) {
    if (!this.#inProgress) {
      this.#readyTransition(
          elementID,
          finalStyles,
          duration,
          animationType,
          this.#transition !== null ? 'later' : 'along'
      );
    }

    return this;
  }

  /**
   * start transition
   * @param {{tolog: boolean, autoReverse: boolean, alternate:boolean, animationType: AnimationType}} options
   */
  activate(options) {
    const autoReverse = !!options.autoReverse;
    const allowToActivate = !!autoReverse;
    const inProgress = this.isInProgress;

    if (
      (inProgress || !this.#transition) &&
      !allowToActivate
    ) return;

    if (!this.inPlanTimings && !!options.animationType) {
      this.#timings(options.animationType);
    }
    if (autoReverse && !this.#isFirstTime) this.switch();

    this.#inProgress = true;
    this.#isFirstTime = false;

    this.#isLog = !!options.tolog;
    this.#isAlternate = !!options.alternate;

    if (!inProgress) this.#animate();
  }

  /**
   * Recommended to be called after loading of DOM or appending of element at DOM
   */
  responsive() {
    this.#styleState = new StyleState(this);
    this.registerStyleState(this.#styleState);
    window.addEventListener('resize', () => {
      window.requestAnimationFrame(() => this.#styleState.refresh());
    });
  }

  /**
   *
   * @param {AnimationType} animationType
   */
  #timings(animationType) {
    super.timings(this.duration, animationType);
    this.calculateProgressPoints({
      start: 0,
      end: 0,
      total: this.duration
    });
  }

  /**
   *
   */
  stopTransition() {
    if (!this.#inProgress) return;
    this.#reset();
  }

  /**
   * @return {boolean}
   */
  get isInProgress() {
    return this.#inProgress;
  }

  /**
   * Total duration of transition
   * @return {number}
   */
  get duration() {
    if (typeof super.duration !== 'number') {
      super.duration = this.#transition.calculateDuration();
    }
    return super.duration;
  }

  /**
   *
   * @param {TransitionProgressPlan} progressPlan
   * @return {boolean}
   */
  update(progressPlan) {
    return this.#transition.update(progressPlan);
  }

  /**
   * Switch Transition
   */
  switch() {
    super.switchProgression();
    this.#transition = this.#transition.switch();
  }

  /**
   * @param {StyleState} styleStateArg
   */
  registerStyleState(styleStateArg) {
    this.#transition.registerStyleState(styleStateArg);
  }

  /**
   *
   * @param {ProgressObj} progressObj
   * @return {number}
   */
  calculateProgressPoints(progressObj) {
    return this.#transition.calculateProgressPoints(null, progressObj);
  }
}

export {
  topPx,
  heightPx,
  transformRotateDeg,
  borderRadiusPx,
  opacity,
  heightObject,
  cssPx,
  PropertyState,
  TransitionPlan
};

// create github repo and npm package
//   two point concept
//   responsive

// shake issue
//   https://jsfiddle.net/kh9wvaod/
//   https://jsfiddle.net/3vqcy1bz/

// later implementation
//   assigning array of values for final, for properties with multiple values like transform
//     need to use multiple "?" placeholder and need to match the number of placeholders to the final values
//   allows to add or change transition during mid transition
//     adding additional transition during transition: just call with/later/etc on existing PropertiesTransition
//     changing transition during transition: call a "change" method then call with/later/etc on existing PropertiesTransition
