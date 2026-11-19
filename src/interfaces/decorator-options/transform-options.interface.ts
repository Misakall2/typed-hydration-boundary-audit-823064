/**
 * Possible transformation options for the @Transform decorator.
 */
export interface TransformOptions {
  /**
   * First version where this property should be exposed.
   *
   * Example:
   * ```ts
   * instanceToPlain(payload, { version: 1.0 });
   * ```
   */
  since?: number;

  /**
   * Last version where this property should be exposed.
   *
   * Example:
   * ```ts
   * instanceToPlain(payload, { version: 1.0 });
   * ```
   */
  until?: number;

  /**
   * List of transformation groups this property belongs to. When set,
   * the property will be exposed only when transform is called with
   * one of the groups specified.
   *
   * Example:
   * ```ts
   * instanceToPlain(payload, { groups: ['user'] });
   * ```
   */
  groups?: string[];

  /**
   * List of audiences this custom transformation is declared for. When a
   * transformation runs for a given audience, the custom transformation is
   * applied only when its declaration lists that audience. A transformation
   * without an audience declaration never runs for an audience-scoped call, so
   * a rejected property cannot reach a custom transformation callback.
   */
  audiences?: string[];

  /**
   * Expose this property only when transforming from plain to class instance.
   */
  toClassOnly?: boolean;

  /**
   * Expose this property only when transforming from class instance to plain object.
   */
  toPlainOnly?: boolean;
}
