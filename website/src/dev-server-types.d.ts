// This package seems to be on npm under both the ‘parcel’ and ‘parcel-bundler’
// names, with ‘parcel’ preferred by upstream, but DefinitelyTyped uses
// ‘parcel-bundler’.
declare module "parcel" {
  import ParcelBundler from "parcel-bundler";
  export default ParcelBundler;
}
