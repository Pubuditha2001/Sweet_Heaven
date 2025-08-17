import React from "react";

export default function FAQ() {
  return (
    <div className="mt-0 bg-gray-50 pt-5 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-0">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="bg-white shadow-md rounded-lg divide-y divide-gray-200 max-w-3xl mx-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">
                How far in advance should I order a custom cake?
              </h3>
              <p className="mt-2 text-gray-600">
                We recommend placing custom cake orders at least 7-10 days in
                advance. For special occasions like weddings, we suggest
                ordering 3-4 weeks ahead.
              </p>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Do you deliver cakes?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes, we offer delivery services within Kurunegala. Delivery fees
                vary based on distance. Contact us for more details about
                delivery options and fees.
              </p>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Can you accommodate dietary restrictions?
              </h3>
              <p className="mt-2 text-gray-600">
                We offer various options including eggless, sugar-free, and
                gluten-friendly cakes. Please let us know about any dietary
                restrictions when placing your order.
              </p>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">
                How do I care for my cake?
              </h3>
              <p className="mt-2 text-gray-600">
                Our cakes are best stored in a refrigerator. We recommend
                removing the cake from the refrigerator 30 minutes before
                serving for the best taste and texture.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
